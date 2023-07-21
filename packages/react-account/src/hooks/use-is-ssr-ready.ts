import { useCrossbellModelState } from "./crossbell-model";

export function useIsSsrReady(): boolean {
	return useCrossbellModelState((s) => s.ssrReady, []);
}
