import { useRefCallback } from "@crossbell/util-hooks";
import { showNotification } from "@mantine/notifications";

import { modalConfig } from "../modal-config";
import { useConnectedAccount } from "./use-connected-account";

const noEnoughCSB = "You do not have enough $CSB to perform this action";

export function useHandleError(title: string) {
	const account = useConnectedAccount();
	const isWallet = account?.type === "wallet";

	return useRefCallback((err: unknown) => {
		const message = err instanceof Error ? err.message : `${err}`;

		if (isWallet && message === noEnoughCSB) {
			return modalConfig.showNoEnoughCSBModal("transfer-csb-to-operator");
		}

		showNotification({
			title,
			message,
			color: "red",
		});
	});
}
