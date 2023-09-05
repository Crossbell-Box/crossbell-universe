import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { type Numberish } from "crossbell";

import {
	getAddressMiraBalance,
	getCharacterMiraBalance,
} from "@crossbell/store/apis";
import { useContract } from "../use-contract";
import { useConnectedAccount } from "../use-connected-account";
import type { AccountBalance } from "@crossbell/store";

export type UseAccountMiraBalanceResult = {
	balance: AccountBalance | null;
	isLoading: boolean;
};

export const SCOPE_KEY_ACCOUNT_MIRA_BALANCE = ({
	address,
	characterId,
}: {
	address?: Address;
	characterId?: Numberish;
}) => ["connect-kit", "account-mira-balance", address, characterId];

export function useAccountMiraBalance(): UseAccountMiraBalanceResult {
	const account = useConnectedAccount();
	const address = account?.address;
	const contract = useContract();

	const { data, isLoading } = useQuery(
		SCOPE_KEY_ACCOUNT_MIRA_BALANCE({
			address,
			characterId: account?.character?.characterId,
		}),
		() =>
			account?.type === "email"
				? getCharacterMiraBalance({
						contract,
						characterId: account.character.characterId,
				  })
				: address
				? getAddressMiraBalance({
						contract,
						address: address!,
				  })
				: null,
		{ enabled: !!address || !!account?.character?.characterId },
	);

	return { balance: data ?? null, isLoading };
}
