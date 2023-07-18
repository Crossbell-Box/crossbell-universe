import React from "react";
import { useConnect } from "wagmi";
import { showNotification } from "@mantine/notifications";
import { useRefCallback } from "@crossbell/util-hooks";

import { checkIsWalletConnectConnector } from "../utils";
import { connectorStore } from "./connectors/store";
import { WalletConnectConnector } from "./connectors";

export function useDefaultWalletConnect() {
	const { connectAsync, connectors } = useConnect();
	const _connector = React.useMemo(
		() => connectors.find(checkIsWalletConnectConnector),
		[connectors],
	);

	const openDefaultWalletConnect = useRefCallback(async () => {
		if (_connector) {
			try {
				const connector = new WalletConnectConnector({
					options: { ..._connector.options, showQrModal: true },
				});
				const preferredChainId = connector?.chains[0]?.id;
				const result = await connectAsync({
					chainId: preferredChainId,
					connector: connector,
				});

				connectorStore.getState().setConnectedConnectorId(connector.id);

				if (result.chain.id !== connector.chains[0]?.id) {
					connector.switchChain?.(preferredChainId);
				}
			} catch (err) {
				showNotification({
					title: "Error while connecting to WalletConnect",
					message: err instanceof Error ? err.message : `${err}`,
					color: "red",
				});
			}
		} else {
			showNotification({
				title: "Error while connecting to WalletConnect",
				message: "No WalletConnect connector available",
				color: "red",
			});
		}
	});

	return {
		canOpenWalletConnect: !!_connector,
		openDefaultWalletConnect,
	};
}
