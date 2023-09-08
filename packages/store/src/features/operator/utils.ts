import { CharacterPermissionKey } from "crossbell";
import { Address } from "viem";
import { indexer } from "@crossbell/indexer";

export function haveSamePermissions(
	a: CharacterPermissionKey[],
	b: CharacterPermissionKey[] | null | undefined,
) {
	const map = getPermissionMap(b ?? []);

	return a.every((permission) => map.has(permission));
}

function getPermissionMap(permissions: CharacterPermissionKey[]) {
	return permissions.reduce((map, permission) => {
		map.set(permission, true);
		return map;
	}, new Map<string, boolean>());
}

export async function checkIfCharacterOperatorHasPermissions({
	operatorAddress,
	permissions,
	characterId,
}: {
	operatorAddress: Address;
	permissions: CharacterPermissionKey[];
	characterId: number | null;
}) {
	if (!characterId) return false;

	const data =
		(await indexer.operator.getForCharacter(characterId, operatorAddress))
			?.permissions ?? null;

	return haveSamePermissions(permissions, data);
}
