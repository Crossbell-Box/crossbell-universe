import { createContract } from "crossbell";

import {
	injectContractChecker,
	InjectContractCheckerOptions,
	ContractCheckerDelegate,
} from "./inject-contract-checker";

export * from "./errors";

export type ContractDelegate = ContractCheckerDelegate;
export type ContractProvider = Exclude<
	Parameters<typeof createContract>[0],
	string | undefined
>;

export function contractActions(
	options: Omit<InjectContractCheckerOptions, "contract">,
) {
	const listeners = new Set<() => void>();
	let contract = injectContractChecker(createContract(), options);

	return {
		get() {
			return contract;
		},

		setProvider(provider: ContractProvider) {
			const account = options.getCurrentAddress() ?? undefined;

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
