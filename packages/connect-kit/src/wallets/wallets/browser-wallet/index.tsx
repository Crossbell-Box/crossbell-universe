import type { InjectedConnector } from "wagmi/connectors/injected";
import React from "react";

import { WalletIcon } from "../../../components";
import { Wallet } from "../../types";
import styles from "../coinbase-wallet/index.module.css";

export const browserWallet = (connector?: InjectedConnector): Wallet | null => {
	if (!connector) return null;

	const installed =
		typeof window !== "undefined" && typeof window.ethereum !== "undefined";

	return installed
		? {
				id: "injected",
				name: "Browser Wallet",
				installed: installed,
				createConnector: () => {
					return { connector };
				},
				icon: <WalletIcon className={styles.icon} />,
			}
		: null;
};
