import { useAccountCharacter } from "./use-account-character";

export function useAccountCharacterId() {
	return useAccountCharacter()?.characterId;
}
