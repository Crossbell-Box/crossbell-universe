import { useCrossbellModelState } from "./crossbell-model";

export function useIsWalletSignedIn() {
	return useCrossbellModelState((_, m) => m.getIsWalletSignedIn(), []);
}
