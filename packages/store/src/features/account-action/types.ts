import { CharacterEntity, Contract, Indexer } from "crossbell";

import { EmailAccount } from "../email";
import { WalletAccount } from "../wallet";
import { SiweInfo } from "../wallet/siwe";

export type Context<T> = {
	contract: Contract;
	indexer: Indexer;
} & T;

export interface WalletAccountWithCharacter extends WalletAccount {
	character: CharacterEntity;
}

export type AccountTypeBasedHooksFactory<Variables, Data, OptionalCharacter> =
	() => {
		email?: (
			v: Variables,
			context: Context<{ account: EmailAccount }>,
		) => Promise<Data>;

		opSign?: (
			v: Variables,
			context: Context<{
				account: Omit<WalletAccountWithCharacter, "siwe">;
				siwe: SiweInfo;
			}>,
		) => Promise<Data>;

		contract?: (
			v: Variables,
			context: Context<{
				account: Omit<
					OptionalCharacter extends true
						? WalletAccount
						: WalletAccountWithCharacter,
					"siwe"
				>;
			}>,
		) => Promise<Data>;

		onSuccess?: (params: {
			data: Data | null;
			variables: Variables;
			account: EmailAccount | WalletAccount | null;
		}) => Promise<void>;
	};
