import { CharacterLinkType } from "@crossbell/indexer";

import {
	unlinkCharacter,
	siweUnlinkCharacter,
	getIsLinked,
} from "@crossbell/store/apis";
import {
	AccountTypeBasedMutationOptions,
	createAccountTypeBasedMutationHooks,
} from "../account-type-based-hooks";

export type UnlinkCharacterOptions = AccountTypeBasedMutationOptions<
	typeof useUnlinkCharacter
>;

export const useUnlinkCharacter = createAccountTypeBasedMutationHooks<
	CharacterLinkType,
	{ characterId: number }
>({ actionDesc: "unlinking character", withParams: true }, (linkType) => ({
	async email({ characterId }, { account }) {
		const isLinked = await getIsLinked({
			fromCharacterId: account.character.characterId,
			toCharacterId: characterId,
			linkType,
		});

		if (!isLinked) return null;

		return unlinkCharacter({
			token: account.token,
			toCharacterId: characterId,
			linkType,
		});
	},

	wallet: {
		supportOPSign: true,

		async action({ characterId }, { account, siwe, contract }) {
			if (account?.character?.characterId) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (!isLinked) return null;

				if (siwe) {
					return siweUnlinkCharacter({
						characterId: account.character.characterId,
						siwe,
						toCharacterId: characterId,
						linkType,
					});
				} else {
					return contract.link.unlinkCharacter({
						fromCharacterId: account.character.characterId,
						toCharacterId: characterId,
						linkType: linkType,
					});
				}
			}
		},
	},
}));
