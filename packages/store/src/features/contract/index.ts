import { createContract } from "crossbell";

import {
	injectContractChecker,
	InjectContractCheckerOptions,
	ContractCheckerDelegate,
} from "./inject-contract-checker";
import { Address } from "viem";

export * from "./errors";

export type ContractDelegate = ContractCheckerDelegate;
export type ContractProvider = Exclude<
	Parameters<typeof createContract>[0],
	string | undefined
>;
export type ContractActions = ReturnType<typeof contractActions>;

export function contractActions(
	options: Omit<InjectContractCheckerOptions, "contract">,
) {
	const listeners = new Set<() => void>();
	let contract = injectContractChecker(createContract(), options);

	return {
		get() {
			return contract;
		},

		setProvider({
			provider,
			address: account,
		}: {
			provider: ContractProvider;
			address: Address;
		}) {
			contract = injectContractChecker(
				createContract(provider, { account }),
				options,
			);

			listeners.forEach((fn) => fn());
		},

		subscribe(fn: () => void) {
			listeners.add(fn);

			return () => {
				listeners.delete(fn);
			};
		},
	};
}
