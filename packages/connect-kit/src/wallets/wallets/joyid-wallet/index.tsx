import React from "react";
import type { JoyIdConnector } from "@joyid/wagmi";

import { JoyidIcon } from "../../../components";
import { Wallet } from "../../types";

import styles from "../coinbase-wallet/index.module.css";

export const joyidWallet = (connector?: JoyIdConnector): Wallet | null => {
	if (!connector) return null;

	const installed = typeof window !== "undefined";

	return installed
		? {
				id: "joyid",
				name: "JoyID Passkey",
				installed: installed,
				icon: <JoyidIcon className={styles.icon} />,
				createConnector: () => ({ connector }),
			}
		: null;
};
