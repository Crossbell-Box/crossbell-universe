import { useRefCallback } from "@crossbell/util-hooks";

import { useContext } from "../context";
import { useCrossbellModel } from "./crossbell-model";

export function useDisconnectAccount(afterDisconnect?: () => void) {
	const { onDisconnect } = useContext();
	const model = useCrossbellModel();

	return useRefCallback(() => {
		onDisconnect();
		model.wallet.disconnect();
		model.email.disconnect();
		afterDisconnect?.();
	});
}
