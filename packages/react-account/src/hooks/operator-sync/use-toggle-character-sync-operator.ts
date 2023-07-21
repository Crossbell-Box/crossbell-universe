import { useToggleCharacterOperator } from "../character-operator";
import { useCrossbellModelState } from "../crossbell-model";

import { X_SYNC_OPERATOR_ADDRESS, X_SYNC_OPERATOR_PERMISSIONS } from "./consts";

export function useToggleCharacterSyncOperator(): ReturnType<
	typeof useToggleCharacterOperator
> {
	const [isEmail, characterId] = useCrossbellModelState((_, m) => {
		const account = m.getCurrentAccount();
		return [account?.type === "email", account?.character?.characterId];
	}, []);

	const [{ hasPermissions, toggleOperator }, mutation] =
		useToggleCharacterOperator({
			operatorAddress: X_SYNC_OPERATOR_ADDRESS,
			permissions: X_SYNC_OPERATOR_PERMISSIONS,
			characterId,
		});

	return [
		{
			hasPermissions: isEmail ? true : hasPermissions,
			toggleOperator,
		},
		mutation,
	];
}
