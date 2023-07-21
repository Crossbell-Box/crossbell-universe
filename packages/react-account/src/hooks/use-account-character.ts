import { useCrossbellModelState } from "./crossbell-model";

export function useAccountCharacter() {
	return useCrossbellModelState(
		(_, m) => m.getCurrentAccount()?.character ?? null,
		[],
	);
}
