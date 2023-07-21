import { deleteAccount } from "@crossbell/store/apis";
import { useCrossbellModel } from "./crossbell-model";
import { createAccountTypeBasedMutationHooks } from "./account-type-based-hooks";

export const useDeleteEmailAccount = createAccountTypeBasedMutationHooks(
	{
		actionDesc: "delete email account",
		withParams: false,
		connectType: "email",
	},
	() => {
		const model = useCrossbellModel();

		return {
			async email(_, { account }) {
				await deleteAccount(account.token);
			},

			onSuccess: async () => model.email.disconnect(),
		};
	},
);
