import { useContext } from "../../context";
import { useCharacterOperatorHasPermissions } from "../character-operator";

import { OP_SIGN_OPERATOR_PERMISSIONS } from "./consts";
import { useOpSignConfig } from "./use-op-sign-config";

export type UseOPSignOperatorHasPermissionsOptions = {
	characterId: number | null | undefined;
};

export function useOPSignOperatorHasPermissions(
	options?: UseOPSignOperatorHasPermissionsOptions,
) {
	const { disableOPSign } = useContext();
	const opSignConfig = useOpSignConfig();
	const characterOperatorHasPermissions = useCharacterOperatorHasPermissions({
		operatorAddress: opSignConfig.address,
		permissions: OP_SIGN_OPERATOR_PERMISSIONS,
		characterId: options?.characterId,
	});

	return !disableOPSign && characterOperatorHasPermissions;
}
