import { formatUnits } from "viem";

import type { AccountBalance } from "../types";

export function csbToBalance(
	csb: Parameters<BigIntConstructor>[0],
): AccountBalance {
	const decimals = 18;
	const value = BigInt(csb);

	return {
		decimals,
		formatted: formatUnits(value, decimals),
		symbol: "CSB",
		value,
	};
}
