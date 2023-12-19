import type { Numberish } from "crossbell";
import type { Address } from "viem";

import { getMiraTokenDecimals, emailTip } from "../../apis";
import { createAccountTypeBasedMutationHooks } from "../account-type-based-hooks";

import { SCOPE_KEY_TIPS_LIST } from "./use-tip-list";
import { SCOPE_KEY_ACCOUNT_MIRA_BALANCE } from "./use-account-mira-balance";

export type UseTipOptions = {
	amount: number;
	characterId: Numberish;
	noteId?: Numberish;
	feeReceiver?: Address;
};

export const useTip = createAccountTypeBasedMutationHooks<void, UseTipOptions>(
	{ actionDesc: "send tip", withParams: false },
	() => ({
		wallet: {
			supportOPSign: false,

			async action(
				{ characterId, noteId: toNoteId, amount, feeReceiver },
				{ contract, account },
			) {
				if (account.characterId) {
					const decimal = await getMiraTokenDecimals(contract);
					const options = {
						fromCharacterId: account.characterId,
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
				}
			},
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

		onSuccess({ queryClient, variables, account }) {
			const { characterId, noteId } = variables;

			return Promise.all([
				queryClient.invalidateQueries(
					SCOPE_KEY_ACCOUNT_MIRA_BALANCE({ address: account!.address! }),
				),

				queryClient.invalidateQueries(
					SCOPE_KEY_TIPS_LIST({
						toCharacterId: characterId,
						toNoteId: noteId,
						characterId: account?.characterId,
					}),
				),
			]);
		},
	}),
);
