import {
	SCOPE_KEY_CHARACTER,
	SCOPE_KEY_CHARACTER_BY_HANDLE,
} from "@crossbell/indexer";

import { updateHandle } from "../apis";

import { createAccountTypeBasedMutationHooks } from "./account-type-based-hooks";

export const useUpdateCharacterHandle = createAccountTypeBasedMutationHooks<
	void,
	{ characterId: number; handle: string }
>({ actionDesc: "setting character handle", withParams: false }, () => ({
	async email({ characterId, handle }, { account }) {
		if (account.characterId === characterId) {
			return updateHandle(account?.token, handle);
		}
	},

	wallet: {
		supportOPSign: false,

		async action({ characterId, handle }, { contract }) {
			return contract.setHandle(characterId, handle);
		},
	},

	onSuccess({ queryClient, variables }) {
		const { characterId, handle } = variables;

		return Promise.all([
			queryClient.invalidateQueries(SCOPE_KEY_CHARACTER(characterId)),
			queryClient.invalidateQueries(SCOPE_KEY_CHARACTER_BY_HANDLE(handle)),
		]);
	},
}));
