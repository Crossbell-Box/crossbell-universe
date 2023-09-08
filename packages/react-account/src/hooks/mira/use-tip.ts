import type { Numberish } from "crossbell";
import type { Address } from "viem";

import { getMiraTokenDecimals, emailTip } from "@crossbell/store/apis";
import { useCrossbellModel } from "../crossbell-model";
import { createAccountTypeBasedMutationHooks } from "../account-type-based-hooks";

import { SCOPE_KEY_TIPS_LIST } from "./use-tip-list";

export type UseTipOptions = {
	amount: number;
	characterId: Numberish;
	noteId?: Numberish;
	feeReceiver?: Address;
};

export const useTip = createAccountTypeBasedMutationHooks<void, UseTipOptions>(
	{ actionDesc: "send tip", withParams: false },
	() => {
		const model = useCrossbellModel();

		return {
			wallet: {
				supportOPSign: false,

				async action(
					{ characterId, noteId: toNoteId, amount, feeReceiver },
					{ contract, account },
				) {
					if (account.character?.characterId) {
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
					model.refresh(),

					queryClient.invalidateQueries(
						SCOPE_KEY_TIPS_LIST({
							toCharacterId: characterId,
							toNoteId: noteId,
							characterId: account?.character?.characterId,
						}),
					),
				]);
			},
		};
	},
);
