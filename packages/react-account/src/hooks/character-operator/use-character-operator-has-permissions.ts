import React from "react";
import { CharacterPermissionKey } from "crossbell.js";

import { useCharacterOperatorPermissions } from "./use-character-operator-permissions";
import { haveSamePermissions } from "./utils";

export type UseCharacterOperatorHasPermissionsOptions = {
	operatorAddress: string;
	permissions: CharacterPermissionKey[];
	characterId: number | null | undefined;
};

export function useCharacterOperatorHasPermissions({
	operatorAddress,
	permissions,
	characterId,
}: UseCharacterOperatorHasPermissionsOptions) {
	const { data } = useCharacterOperatorPermissions({
		operatorAddress,
		characterId,
	});

	return React.useMemo(
		() => haveSamePermissions(permissions, data),
		[permissions, data]
	);
}
