import { Address, Hex } from "viem";

export type BaseSigner = {
	signMessage: (msg: string) => Promise<Hex | undefined>;
	getAddress: () => Promise<Address | undefined>;
};

export type StateStorage = {
	getItem: (name: string) => string | null | Promise<string | null>;
	setItem: (name: string, value: string) => void | Promise<void>;
	removeItem: (name: string) => void | Promise<void>;
};

export type AccountBalance = {
	decimals: number;
	formatted: string;
	symbol: string;
	value: bigint;
};
