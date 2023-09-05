import React from "react";
import { useRefCallback } from "@crossbell/util-hooks";

import type {
	StateStorage,
	ContractProvider,
	BaseSigner,
} from "@crossbell/store";
import {
	CrossbellModelProvider,
	CrossbellModelProviderProps,
} from "./crossbell-model-provider";

export type ReactAccountContext = {
	disableOPSign?: boolean;
	onDisconnect: () => void;
	getSigner: () => Promise<BaseSigner | undefined>;
};

const Context = React.createContext<ReactAccountContext>({
	onDisconnect() {
		throw new Error("onDisconnect not implemented");
	},

	getSigner() {
		throw new Error("getSigner not implemented");
	},
});

export type ReactAccountProviderProps = {
	children: React.ReactNode;
	provider: ContractProvider | null;
	getStorage: () => StateStorage | null;
} & ReactAccountContext &
	CrossbellModelProviderProps;

export function ReactAccountProvider(props: ReactAccountProviderProps) {
	const { disableOPSign = false } = props;
	const onDisconnect = useRefCallback(props.onDisconnect);
	const getSigner = useRefCallback(props.getSigner);

	const value = React.useMemo(
		() => ({
			onDisconnect,
			getSigner,
			disableOPSign,
		}),
		[onDisconnect, getSigner, disableOPSign],
	);

	return (
		<Context.Provider value={value}>
			<CrossbellModelProvider {...props}>
				{props.children}
			</CrossbellModelProvider>
		</Context.Provider>
	);
}

export function useContext() {
	return React.useContext(Context);
}
