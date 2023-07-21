import React from "react";

import { WalletAccount, EmailAccount, AccountBalance } from "@crossbell/store";
import { useConnectedAccount } from "./use-connected-account";

export type UseAccountBalanceResult = {
	balance: AccountBalance | null;
	isLoading: boolean;
};

export const SCOPE_KEY_ACCOUNT_BALANCE = (
	account: WalletAccount | EmailAccount | null,
) => [
	"connect-kit",
	"balance",
	account?.type,
	account?.type === "email" ? account.email : account?.address,
];

export function useAccountBalance(
	type?: Parameters<typeof useConnectedAccount>[0],
): UseAccountBalanceResult {
	const balance = useConnectedAccount(type)?.balance ?? null;

	return React.useMemo(() => ({ balance, isLoading: false }), [balance]);
}

export function useEmailAccountBalance() {
	return useAccountBalance("email");
}

export function useWalletAccountBalance() {
	return useAccountBalance("wallet");
}
