import type { AccountBalance } from "@crossbell/store";

import { useConnectedAccount } from "../use-connected-account";

export type UseAccountMiraBalanceResult = {
	balance: AccountBalance | null;
	isLoading: boolean;
};

export function useAccountMiraBalance(): UseAccountMiraBalanceResult {
	const account = useConnectedAccount();

	return { balance: account?.mira ?? null, isLoading: false };
}
