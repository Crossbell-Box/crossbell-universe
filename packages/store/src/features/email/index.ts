import { indexer } from "@crossbell/indexer";
import { OrchModel, mutation } from "@orch/core";
import { CharacterEntity, Contract } from "crossbell";
import { parseEther } from "viem";

import {
	fetchAccountInfo,
	getCharacterMiraBalance,
	refillBalance as doRefillBalance,
} from "../../apis";
import type { AccountBalance } from "../../types";
import { csbToBalance } from "../../utils";
import { BaseAccount } from "../../types";

export interface EmailAccount extends BaseAccount<"email"> {
	character: CharacterEntity;
	address: undefined;
	token: string;
	email: string;
	lastCSBRefillTimestamp: number | null;
}

export type EmailState = { email: EmailAccount | null };

const ONE_DAY_TIMESTAMP = 86400000;

export enum RefillEmailBalanceStatusType {
	ableToRefill = "ableToRefill",
	todayAlreadyRefilled = "todayAlreadyRefilled",
	tooMuchCSB = "tooMuchCSB",
	userNotConnected = "userNotConnected",
}

const RefillEmailBalanceStatusMsg: Record<
	RefillEmailBalanceStatusType,
	string
> = {
	ableToRefill: "Able To Refill",
	todayAlreadyRefilled: "You can only claim CSB once a day.",
	tooMuchCSB: "You can only claim CSB when your CSB is under 0.02.",
	userNotConnected: "User Not Connected",
};

export type EmailActionsDelegate = {
	showClaimCSBTipsModal: (msg: string) => void;
	showErrorMsg: (msg: string) => void;
	getContract: () => Contract;
};

export function emailActions<T extends EmailState>(
	model: OrchModel<T>,
	delegate: EmailActionsDelegate,
) {
	const disconnect = mutation(model, (state) => {
		state.email = null;
	});

	const connect = async (token: string) => {
		const error = (message: string) => {
			disconnect();
			delegate.showErrorMsg(message);
			throw new Error(message);
		};

		const onSuccess = mutation(
			model,
			(
				state,
				account: Omit<
					EmailAccount,
					"type" | "address" | "lastCSBRefillTimestamp"
				>,
			) => {
				state.email = {
					type: "email",
					address: undefined,
					lastCSBRefillTimestamp: null,
					...account,
				};
			},
		);

		const info = await fetchAccountInfo(token);

		if (!info.ok) {
			return error(`FetchAccountInfoError: ${info.msg}`);
		}

		const character = await indexer.character.get(info.characterId);

		if (!character) {
			return error(`No character for ${info.characterId}`);
		}

		onSuccess({
			token,
			character,
			balance: csbToBalance(info.csb),
			email: info.email,
			mira: await getCharacterMiraBalance({
				contract: delegate.getContract(),
				characterId: character.characterId,
			}),
		});
	};

	const refresh = async () => {
		const { email } = model.getState();

		if (email) {
			await connect(email.token);
		}
	};

	const refillBalance = async () => {
		const beforeRefill = mutation(model, (state) => {
			state.email!.lastCSBRefillTimestamp = Date.now();
		});

		const { email } = model.getState();

		if (
			!email ||
			checkIsAbleToRefillEmailBalance({
				email,
				showClaimCSBTipsModal: delegate.showClaimCSBTipsModal,
			})
		) {
			return;
		}

		beforeRefill();

		const result = await doRefillBalance(email);

		if ("balance" in result && result.balance) {
			return refresh();
		}

		if ("message" in result) {
			return delegate.showClaimCSBTipsModal(result.message);
		}

		throw new Error(
			`Unexpected Refill Balance Result: ${JSON.stringify(result)}`,
		);
	};

	return {
		connect,
		refresh,
		refillBalance,
		disconnect,
	};
}

function getRefillEmailBalanceStatus(email: EmailAccount | null) {
	const type = (() => {
		if (email) {
			const { lastCSBRefillTimestamp, balance } = email;

			if (hasEnoughCsb(balance)) {
				return RefillEmailBalanceStatusType.tooMuchCSB;
			}

			return isMoreThanADaySinceLastClaim(lastCSBRefillTimestamp)
				? RefillEmailBalanceStatusType.ableToRefill
				: RefillEmailBalanceStatusType.todayAlreadyRefilled;
		} else {
			return RefillEmailBalanceStatusType.userNotConnected;
		}
	})();

	return { type, msg: RefillEmailBalanceStatusMsg[type] };
}

function checkIsAbleToRefillEmailBalance(params: {
	email: EmailAccount | null;
	showClaimCSBTipsModal?: (msg: string) => void;
}) {
	const status = getRefillEmailBalanceStatus(params.email);

	switch (status.type) {
		case RefillEmailBalanceStatusType.ableToRefill:
			return true;
		case RefillEmailBalanceStatusType.todayAlreadyRefilled:
		case RefillEmailBalanceStatusType.tooMuchCSB:
		case RefillEmailBalanceStatusType.userNotConnected:
			params.showClaimCSBTipsModal?.(status.msg);
			return false;
	}
}

function isMoreThanADaySinceLastClaim(
	lastCSBRefillTimestamp: EmailAccount["lastCSBRefillTimestamp"],
): boolean {
	if (!lastCSBRefillTimestamp) {
		return true;
	}

	return Date.now() - lastCSBRefillTimestamp > ONE_DAY_TIMESTAMP;
}

function hasEnoughCsb(balance: AccountBalance): boolean {
	const threshold = parseEther("0.02");
	return balance.value >= threshold;
}
