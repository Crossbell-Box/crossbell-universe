import React from "react";
import { useConnectedAccount } from "@crossbell/react-account";

import { useConnectModal } from "../connect-modal";
import { useIsSupportedChain } from "./use-is-supported-chain";
import { useSwitchNetworkModal } from "./stores";

export function useAutoDisplaySwitchNetworkModal(isActive = true) {
	const { show } = useSwitchNetworkModal();
	const isWalletConnected = !!useConnectedAccount("wallet");
	const isConnectModalActive = useConnectModal((s) => s.isActive);
	const isSupportedChain = useIsSupportedChain();

	React.useEffect(() => {
		if (isConnectModalActive || !isActive) return;

		if (!isSupportedChain && isWalletConnected) {
			show();
		}
	}, [isSupportedChain, isConnectModalActive, isWalletConnected, isActive]);
}
