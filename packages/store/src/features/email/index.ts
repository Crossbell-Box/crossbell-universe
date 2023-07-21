import { indexer } from "@crossbell/indexer";
import { OrchModel, mutation } from "@orch/core";
import { CharacterEntity } from "crossbell";
import { parseEther } from "viem";

import { fetchAccountInfo, refillBalance as doRefillBalance } from "../../apis";
import type { AccountBalance } from "../../types";
import { csbToBalance } from "../../utils";

export type EmailAccount = {
	type: "email";
	character: CharacterEntity;
	address: undefined;
	token: string;
	email: string;
	balance: AccountBalance;
	lastCSBRefillTimestamp: number | null;
};

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
				data: {
					token: string;
					email: string;
					character: CharacterEntity;
					csb: string;
				},
			) => {
				state.email = {
					type: "email",
					token: data.token,
					address: undefined,
					email: data.email,
					character: data.character,
					balance: csbToBalance(data.csb),
					lastCSBRefillTimestamp: null,
				};
			},
		);

		const result = await fetchAccountInfo(token);

		if (!result.ok) {
			return error(`FetchAccountInfoError: ${result.msg}`);
		}

		const character = await indexer.character.get(result.characterId);

		if (!character) {
			return error(`No character for ${result.characterId}`);
		}

		onSuccess({
			token,
			character,
			csb: result.csb,
			email: result.email,
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
