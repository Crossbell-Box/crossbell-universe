import { Contract, Indexer } from "crossbell";
import { useQueryClient } from "@tanstack/react-query";

import { EmailAccount, WalletAccount, SiweInfo } from "@crossbell/store";

export type Context<T> = {
	contract: Contract;
	indexer: Indexer;
	queryClient: ReturnType<typeof useQueryClient>;
} & T;

export type AccountTypeBasedHooksFactory<Params, Variables, Data> = (
	params: Params,
) => {
	email?: (
		v: Variables,
		context: Context<{ account: EmailAccount }>,
	) => Promise<Data>;

	// TODO: separate wallet into `opSign` and `contract`
	wallet?:
		| {
				supportOPSign: true;
				action: (
					v: Variables,
					context: Context<{
						account: Omit<WalletAccount, "siwe">;
						siwe: SiweInfo | null;
					}>,
				) => Promise<Data>;
		  }
		| {
				supportOPSign: false;
				action: (
					v: Variables,
					context: Context<{ account: Omit<WalletAccount, "siwe"> }>,
				) => Promise<Data>;
		  };

	onSuccess?: (params: {
		data: Data | null;
		variables: Variables;
		account: EmailAccount | WalletAccount | null;
		queryClient: ReturnType<typeof useQueryClient>;
	}) => Promise<unknown>;

	onSettled?: (params: {
		data: Data | null | undefined;
		error: unknown;
		variables: Variables;
		account: EmailAccount | WalletAccount | null;
		queryClient: ReturnType<typeof useQueryClient>;
	}) => Promise<unknown>;
};
