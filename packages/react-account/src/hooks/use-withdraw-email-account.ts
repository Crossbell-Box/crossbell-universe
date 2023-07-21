import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useContract } from "@crossbell/contract";
import { indexer } from "@crossbell/indexer";
import { isAddressEqual } from "viem";

import { getWithdrawProof } from "@crossbell/store/apis";
import { asyncRetry } from "@crossbell/store/utils";
import { useCrossbellModel } from "./crossbell-model";

export function useWithdrawEmailAccount(options?: UseMutationOptions) {
	const account = useCrossbellModel();
	const contract = useContract();

	return useMutation(async () => {
		const { wallet, email } = account.getState();

		if (!wallet || !email) return;

		const { nonce, expires, proof } = await getWithdrawProof({
			token: email.token,
		});

		await contract.character.withdrawFromNewbieVilla({
			toAddress: wallet.address,
			characterId: email.character.characterId,
			nonce: nonce,
			expires: expires,
			proof: proof,
		});

		const character = await asyncRetry(async (RETRY) => {
			const character = await indexer.character.get(
				email.character.characterId,
			);

			return character?.owner && isAddressEqual(character.owner, wallet.address)
				? character!
				: RETRY;
		});

		if (character) {
			await account.wallet.refresh();
			account.wallet.switchCharacter(character);
			await account.email.disconnect();
		}
	}, options);
}
