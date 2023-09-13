import { ipfsUploadFile } from "crossbell/ipfs";
import { indexer } from "@crossbell/indexer";

import { asyncRetry } from "../../utils";
import { accountAction, AccountModel, AccountState } from "../account-action";
import { walletActions } from "../wallet";
import { CharacterEntity } from "crossbell";

export type CreateCharacterVariables = {
	avatar: string | File | null;
	handle: string;
	username: string;
	bio: string;
};

export function characterActions<S extends AccountState>(
	model: AccountModel<S>,
	wallet: ReturnType<typeof walletActions>,
) {
	return {
		create: accountAction<CreateCharacterVariables, CharacterEntity, S>(
			{ model },
			() => ({
				async contract(
					{ bio, avatar: file, handle, username },
					{ contract, account },
				) {
					const avatar = file
						? typeof file === "string"
							? file
							: (await ipfsUploadFile(file)).url
						: null;

					await contract.character.create({
						handle,
						owner: account.address,
						metadataOrUri: {
							bio,
							name: username,
							avatars: [avatar].filter(Boolean) as string[],
						},
					});

					const character = (await asyncRetry(async (RETRY) => {
						return (await indexer.character.getByHandle(handle)) || RETRY;
					}))!;

					await wallet.refresh();

					wallet.switchCharacter(character);

					return character;
				},
			}),
		),
	};
}
