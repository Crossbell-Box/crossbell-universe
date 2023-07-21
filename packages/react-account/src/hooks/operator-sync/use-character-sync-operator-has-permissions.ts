import { useCharacterOperatorHasPermissions } from "../character-operator";
import { useCrossbellModelState } from "../crossbell-model";

import { X_SYNC_OPERATOR_ADDRESS, X_SYNC_OPERATOR_PERMISSIONS } from "./consts";

export function useCharacterSyncOperatorHasPermissions() {
	const [isEmail, characterId] = useCrossbellModelState((_, m) => {
		const account = m.getCurrentAccount();

		return [account?.type === "email", account?.character?.characterId];
	}, []);

	const hasPermissions = useCharacterOperatorHasPermissions({
		operatorAddress: X_SYNC_OPERATOR_ADDRESS,
		permissions: X_SYNC_OPERATOR_PERMISSIONS,
		characterId,
	});

	return isEmail ? true : hasPermissions;
}
