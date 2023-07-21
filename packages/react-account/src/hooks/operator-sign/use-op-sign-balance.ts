import React from "react";
import { formatUnits } from "viem";

import { useCrossbellModel, useCrossbellModelState } from "../crossbell-model";
import type { AccountBalance } from "@crossbell/store";

export function useOpSignBalance(): AccountBalance | null {
	const account = useCrossbellModel();

	const csb = useCrossbellModelState(
		({ wallet }) => wallet?.siwe?.csb ?? null,
		[],
	);

	React.useEffect(() => {
		account.wallet.refresh();
	}, [account]);

	return React.useMemo(() => {
		if (!csb) return null;

		const decimals = 18;
		const value = BigInt(csb);

		return {
			decimals,
			formatted: formatUnits(value, decimals),
			symbol: "CSB",
			value,
		};
	}, [csb]);
}
