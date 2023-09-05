import { CharacterMetadata } from "crossbell";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { useAccount } from "wagmi";
import { indexer } from "@crossbell/indexer";
import {
	SCOPE_KEY_CHARACTER,
	SCOPE_KEY_CHARACTER_BY_HANDLE,
	SCOPE_KEY_CHARACTERS,
	SCOPE_KEY_PRIMARY_CHARACTER,
} from "@crossbell/indexer";

import { asyncRetry } from "@crossbell/store/utils";
import { useCrossbellModel } from "./crossbell-model";
import { useContract } from "./use-contract";

// TODO: refactor this to use account-type-based-hooks
export function useCreateCharacter() {
	const { address } = useAccount();
	const contract = useContract();
	const queryClient = useQueryClient();
	const account = useCrossbellModel();

	return useMutation(
		async ({
			handle,
			metadata,
		}: {
			handle: string;
			metadata: CharacterMetadata;
		}) => {
			return contract.character.create({
				owner: address!,
				handle: handle,
				metadataOrUri: metadata,
			});
		},
		{
			onSuccess: (data, { handle }) => {
				return Promise.all([
					queryClient.invalidateQueries(SCOPE_KEY_CHARACTER(data.data)),
					queryClient.invalidateQueries(SCOPE_KEY_CHARACTERS(address)),
					queryClient.invalidateQueries(SCOPE_KEY_PRIMARY_CHARACTER(address)),
					queryClient.invalidateQueries(SCOPE_KEY_CHARACTER_BY_HANDLE(handle)),
					account.wallet.refresh().then(async () => {
						const character = await asyncRetry(async (RETRY) => {
							return (await indexer.character.getByHandle(handle)) || RETRY;
						});

						if (character) {
							account.wallet.switchCharacter(character);
						}
					}),
				]);
			},
			onError: (err: any) => {
				showNotification({
					title: "Error while creating character",
					message: err.message,
					color: "red",
				});
			},
		},
	);
}
