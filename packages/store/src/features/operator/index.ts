import type { Address } from "viem";
import type {
	Contract,
	Indexer,
	CharacterPermissionKey,
	Numberish,
} from "crossbell";

import { accountAction, AccountState, AccountModel } from "../account-action";
import { asyncRetry } from "../../utils";
import { haveSamePermissions } from "./utils";

export type AddOperatorOptions = {
	characterId: number;
	operator: Address;
	permissions: CharacterPermissionKey[];
};

export type RemoveOperatorOptions = {
	characterId: number;
	operator: Address;
};

export type OperatorActionsDelegate = {
	getIndexer: () => Indexer;
	getContract: () => Contract;
	refreshCharacter: (params: { characterId: Numberish }) => Promise<void>;
};

export function operatorActions<S extends AccountState>(
	model: AccountModel<S>,
	delegate: OperatorActionsDelegate,
) {
	return {
		add: accountAction<AddOperatorOptions, void, S>({ model }, () => ({
			async contract({ characterId, operator, permissions }) {
				await delegate.getContract().operator.grantForCharacter({
					characterId,
					operator,
					permissions,
				});

				await asyncRetry(async (RETRY) => {
					const op = await delegate
						.getIndexer()
						.operator.getForCharacter(characterId, operator);

					return haveSamePermissions(permissions, op?.permissions) || RETRY;
				});
			},

			async onSuccess({ variables }) {
				await delegate.refreshCharacter(variables);
			},
		})),

		remove: accountAction<RemoveOperatorOptions, void, S>({ model }, () => ({
			async contract({ characterId, operator }) {
				await delegate.getContract().operator.grantForCharacter({
					characterId,
					operator,
					permissions: [],
				});

				await asyncRetry(async (RETRY) => {
					const op = await delegate
						.getIndexer()
						.operator.getForCharacter(characterId, operator);
					return op?.permissions.length === 0 || RETRY;
				});
			},

			async onSuccess({ variables }) {
				await delegate.refreshCharacter(variables);
			},
		})),
	};
}
