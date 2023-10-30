import { useSnapshot } from "valtio";

import { opSignConfig, type OpSignConfig } from "./op-sign-config";

export { type OpSignConfig };

export function useOpSignConfig() {
	return useSnapshot(opSignConfig);
}
