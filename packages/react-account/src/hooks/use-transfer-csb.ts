import { waitUntilTransactionFinished } from "@crossbell/store/apis";
import { type Address } from "viem";

import { useCrossbellModel } from "./crossbell-model";
import { createAccountTypeBasedMutationHooks } from "./account-type-based-hooks";

export type UseTransferCSBParams = {
	toAddress: Address;
	amount: bigint;
};

type Result = { transactionHash: string };

export const useTransferCsb = createAccountTypeBasedMutationHooks<
	void,
	UseTransferCSBParams,
	Result
>({ actionDesc: "transfer CSB", withParams: false }, () => {
	const model = useCrossbellModel();

	return {
		wallet: {
			supportOPSign: false,

			async action({ toAddress, amount }, { contract }) {
				const result = await contract.csb.transfer({ toAddress, amount });

				await waitUntilTransactionFinished(result.transactionHash);

				return result;
			},
		},

		onSuccess() {
			return Promise.all([model.refresh()]);
		},
	};
});
