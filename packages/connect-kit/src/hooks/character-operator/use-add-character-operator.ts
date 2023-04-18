import { indexer } from "@crossbell/indexer";
import { CharacterPermissionKey } from "crossbell.js";

import { asyncRetry } from "../../utils";
import { useAccountState } from "../account-state";
import { createAccountTypeBasedMutationHooks } from "../account-type-based-hooks";
import {
	GET_CHARACTER_OPERATORS_SCOPE_KEY,
	SCOPE_KEY_CHARACTER_OPERATOR,
} from "./const";
import { haveSamePermissions } from "./utils";

export const useAddCharacterOperator = createAccountTypeBasedMutationHooks<
	void,
	{
		characterId: number;
		operator: string;
		permissions: CharacterPermissionKey[];
	}
>({ actionDesc: "adding operator", withParams: false }, () => ({
	wallet: {
		supportOPSign: false,

		async action({ characterId, operator, permissions }, { contract }) {
			await contract.grantOperatorPermissionsForCharacter(
				characterId,
				operator,
				permissions
			);

			await asyncRetry(async (RETRY) => {
				const op = await indexer.getCharacterOperator(characterId, operator);
				return haveSamePermissions(permissions, op?.permissions) || RETRY;
			});
		},
	},

	onSuccess({ queryClient, variables }) {
		return Promise.all([
			useAccountState.getState().refresh(),
			queryClient.invalidateQueries(SCOPE_KEY_CHARACTER_OPERATOR(variables)),
			queryClient.invalidateQueries(
				GET_CHARACTER_OPERATORS_SCOPE_KEY(variables)
			),
		]);
	},
}));
