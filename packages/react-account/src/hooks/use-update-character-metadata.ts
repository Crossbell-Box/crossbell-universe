import { produce, Draft } from "immer";
import { CharacterMetadata } from "crossbell";
import { indexer, SCOPE_KEY_CHARACTER } from "@crossbell/indexer";

import {
	siweUpdateMetadata,
	updateCharactersMetadata,
	waitUntilTransactionFinished,
} from "../apis";
import { useAccountState } from "./account-state";
import { createAccountTypeBasedMutationHooks } from "./account-type-based-hooks";

type EditFn = (draft: Draft<CharacterMetadata>) => void;
type Variables =
	| { edit: EditFn; characterId: number }
	| { metadata: CharacterMetadata; characterId: number };

export const useUpdateCharacterMetadata = createAccountTypeBasedMutationHooks<
	void,
	Variables
>({ actionDesc: "setting character metadata", withParams: false }, () => {
	async function prepareData(variable: Variables) {
		// Make sure character metadata is up-to-date.
		await useAccountState.getState().refresh();
		const account = useAccountState.getState().computed.account;
		const character = await indexer.character.get(variable.characterId);

		if (!account || !character) return null;

		const oldMetadata = character.metadata?.content ?? {};
		const newMetadata =
			"metadata" in variable
				? variable.metadata
				: produce(oldMetadata, variable.edit);

		// Skips redundant requests and just return success status directly.
		if (oldMetadata === newMetadata) return null;

		return newMetadata;
	}

	return {
		async email(variables, { account }) {
			const metadata = await prepareData(variables);

			if (metadata) {
				const { transactionHash } = await updateCharactersMetadata({
					token: account.token,
					metadata,
				});

				await waitUntilTransactionFinished(transactionHash);
			}
		},

		wallet: {
			supportOPSign: true,

			async action(variables, { siwe, contract }) {
				const metadata = await prepareData(variables);

				if (metadata) {
					const { transactionHash } = await (() => {
						if (siwe) {
							return siweUpdateMetadata({
								characterId: variables.characterId,
								siwe,
								metadata,
							});
						} else {
							return contract.character.setMetadata({
								characterId: variables.characterId,
								// crossbell.js will try to modify the object internally,
								// here the immutable object is converted to mutable object to avoid errors.
								metadata: JSON.parse(JSON.stringify(metadata)),
							});
						}
					})();

					await waitUntilTransactionFinished(transactionHash);
				}
			},
		},

		onSuccess({ variables, queryClient }) {
			return Promise.all([
				useAccountState.getState().refresh(),
				queryClient.invalidateQueries(
					SCOPE_KEY_CHARACTER(variables.characterId),
				),
			]);
		},
	};
});
