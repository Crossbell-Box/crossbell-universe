import { indexer } from "@crossbell/indexer";
import type { OrchModel } from "@orch/core";

import { WalletState } from "../wallet";
import { EmailState } from "../email";
import { ContractActions } from "../contract";
import { checkIfCharacterOperatorHasPermissions } from "../operator/utils";

import {
	AccountTypeBasedHooksFactory,
	WalletAccountWithCharacter,
} from "./types";
import {
	OP_SIGN_OPERATOR_ADDRESS,
	OP_SIGN_OPERATOR_PERMISSIONS,
} from "@crossbell/react-account";

export type AccountState = WalletState & EmailState;
export type AccountModel<S extends AccountState> = OrchModel<S> & {
	contract: ContractActions;
};

export function getCurrentAccount<T extends AccountState>(
	model: AccountModel<T>,
) {
	const { email, wallet } = model.getState();

	return email ?? wallet ?? null;
}

export function accountAction<
	Variables,
	Data,
	S extends AccountState,
	OptionalCharacter extends boolean = false,
>(
	{
		model,
		optionalCharacter,
	}: {
		model: AccountModel<S>;
		optionalCharacter?: OptionalCharacter;
	},
	actionFactory: AccountTypeBasedHooksFactory<
		Variables,
		Data,
		OptionalCharacter
	>,
) {
	return async (variables: Variables): Promise<Data | null> => {
		const action = actionFactory();
		const account = getCurrentAccount(model);

		const data = await (async () => {
			if (!account) {
				// FIXME: - handle error and open connect model
				throw new Error("Please connect a account first");
			}

			const contract = model.contract.get();
			const character = account.character;

			if (!optionalCharacter && !character) {
				// FIXME: - handle error and open mint model
				throw new Error("Need to mint a character first");
			}

			switch (account.type) {
				case "email": {
					return (
						(await action.email?.(variables, {
							contract,
							indexer,
							account,
						})) ?? null
					);
				}
				case "wallet": {
					if (
						action.opSign &&
						account.siwe &&
						(await checkIfCharacterOperatorHasPermissions({
							operatorAddress: OP_SIGN_OPERATOR_ADDRESS,
							permissions: OP_SIGN_OPERATOR_PERMISSIONS,
							characterId: character?.characterId ?? null,
						}))
					) {
						return action.opSign(variables, {
							contract,
							indexer,
							account: account as WalletAccountWithCharacter,
							siwe: account.siwe,
						});
					}

					return (
						(await action.contract?.(variables, {
							contract,
							indexer,
							account: account as any,
						})) ?? null
					);
				}
			}
		})();

		await action.onSuccess?.({ data, account, variables });

		return data;
	};
}
