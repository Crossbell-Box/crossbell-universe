import { useToggleCharacterOperator } from "../character-operator";

import { OP_SIGN_OPERATOR_PERMISSIONS } from "./consts";
import { useOpSignConfig } from "./use-op-sign-config";

export type UseToggleOpSignOperatorOptions = {
	characterId: number | null | undefined;
};

export function useToggleOpSignOperator(
	options?: UseToggleOpSignOperatorOptions,
): ReturnType<typeof useToggleCharacterOperator> {
	const opSignConfig = useOpSignConfig();
	const [{ hasPermissions, toggleOperator }, mutation] =
		useToggleCharacterOperator({
			operatorAddress: opSignConfig.address,
			permissions: OP_SIGN_OPERATOR_PERMISSIONS,
			characterId: options?.characterId,
		});

	return [{ hasPermissions, toggleOperator }, mutation];
}
