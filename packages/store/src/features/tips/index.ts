import { Numberish } from "crossbell";
import { Address } from "viem";

import { accountAction, AccountModel, AccountState } from "../account-action";
import { emailTip, getMiraTokenDecimals } from "@crossbell/store/apis";

export type TipsActionsDelegate = {
	refreshMiraBalance: () => Promise<void>;
};

export type SendTipOptions = {
	amount: number;
	characterId: Numberish;
	noteId?: Numberish;
	feeReceiver?: Address;
};

export type SendTipResult = { transactionHash: Address };

export function tipsActions<S extends AccountState>(
	model: AccountModel<S>,
	delegate: TipsActionsDelegate,
) {
	return {
		send: accountAction<SendTipOptions, SendTipResult, S>({ model }, () => ({
			async contract(
				{ characterId, noteId: toNoteId, amount, feeReceiver },
				{ contract, account },
			) {
				const decimal = await getMiraTokenDecimals(contract);
				const options = {
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					amount: BigInt(amount) * BigInt(10) ** BigInt(decimal),
				};

				if (toNoteId) {
					return feeReceiver
						? contract.tipsWithFee.tipCharacterForNote({
								...options,
								toNoteId,
								feeReceiver,
						  })
						: contract.tips.tipCharacterForNote({
								...options,
								toNoteId,
						  });
				} else {
					return feeReceiver
						? contract.tipsWithFee.tipCharacter({ ...options, feeReceiver })
						: contract.tips.tipCharacter(options);
				}
			},

			async email({ characterId, noteId, amount }, { contract, account }) {
				const decimal = await getMiraTokenDecimals(contract);

				return emailTip({
					token: account.token,
					characterId,
					noteId,
					amount: BigInt(amount) * BigInt(10) ** BigInt(decimal),
				});
			},

			onSuccess() {
				return delegate.refreshMiraBalance();
			},
		})),
	};
}
