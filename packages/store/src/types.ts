import type { Hex } from "viem";
import type { CharacterEntity } from "crossbell";

export type BaseSigner = {
	signMessage: (msg: string) => Promise<Hex | undefined>;
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

export type AccountType = "wallet" | "email";

export interface BaseAccount<T extends AccountType> {
	type: T;
	character: CharacterEntity | null;
	balance: AccountBalance;
	mira: AccountBalance;
}
