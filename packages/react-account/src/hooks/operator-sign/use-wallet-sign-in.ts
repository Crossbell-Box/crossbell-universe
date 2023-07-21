import { useMutation } from "@tanstack/react-query";

import { useContext } from "../../context";
import { useCrossbellModel } from "../crossbell-model";

export function useWalletSignIn() {
	const account = useCrossbellModel();
	const { getSigner } = useContext();

	return useMutation(async () => {
		const signer = await getSigner();

		if (signer) {
			await account.wallet.signIn(signer);
		}
	});
}
