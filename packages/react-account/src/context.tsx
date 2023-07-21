import React from "react";
import { useRefCallback } from "@crossbell/util-hooks";
import type { Address, Hex } from "viem";

import { StoreProvider } from "./store";
import { StateStorage } from "@crossbell/store";

export type BaseSigner = {
	signMessage: (msg: string) => Promise<Hex | undefined>;
	getAddress: () => Promise<Address | undefined>;
};

export type ReactAccountContext = {
	disableOPSign?: boolean;
	onDisconnect: () => void;
	getSigner: () => Promise<BaseSigner | undefined>;
	getStorage: () => StateStorage | null;
};

const Context = React.createContext<ReactAccountContext>({
	onDisconnect() {
		throw new Error("onDisconnect not implemented");
	},

	getSigner() {
		throw new Error("getSigner not implemented");
	},

	getStorage() {
		throw new Error("getStorage not implemented");
	},
});

export function ReactAccountProvider(
	props: ReactAccountContext & { children: React.ReactNode },
) {
	const { disableOPSign = false } = props;
	const onDisconnect = useRefCallback(props.onDisconnect);
	const getSigner = useRefCallback(props.getSigner);
	const getStorage = useRefCallback(props.getStorage);
	const value = React.useMemo(
		() => ({ onDisconnect, getSigner, disableOPSign, getStorage }),
		[onDisconnect, getSigner, disableOPSign],
	);

	return (
		<Context.Provider value={value}>
			<StoreProvider getStorage={getStorage}>{props.children}</StoreProvider>
		</Context.Provider>
	);
}

export function useContext() {
	return React.useContext(Context);
}
