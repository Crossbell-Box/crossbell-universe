import { useQuery } from "@tanstack/react-query";
import { useContract } from "@crossbell/contract";

import { getMiraBalance } from "../../apis";
import { useConnectedAccount } from "../use-connected-account";
import { AccountBalance } from "../use-account-balance";

export type UseAccountMiraBalanceResult = {
	balance: AccountBalance | null;
	isLoading: boolean;
};

export const SCOPE_KEY_ACCOUNT_MIRA_BALANCE = ({
	address,
}: {
	address: string;
}) => ["connect-kit", "account-mira-balance", address];

export function useAccountMiraBalance(): UseAccountMiraBalanceResult {
	const account = useConnectedAccount();
	const address = account?.address ?? "";
	const contract = useContract();

	const { data, isLoading } = useQuery(
		SCOPE_KEY_ACCOUNT_MIRA_BALANCE({ address }),
		() => getMiraBalance({ contract, address }),
		{ enabled: !!address }
	);

	return { balance: data ?? null, isLoading };
}
