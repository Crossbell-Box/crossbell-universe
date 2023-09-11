import type { Address } from "viem";
import type { Numberish } from "crossbell";
import type { CharacterLinkType } from "@crossbell/indexer";

import {
	getIsLinked,
	linkCharacter,
	siweLinkCharacter,
	siweUnlinkCharacter,
	unlinkCharacter,
	linkCharacters,
	siweLinkCharacters,
} from "../../apis";
import { accountAction, AccountState, AccountModel } from "../account-action";

export type LinkCharacterOptions = {
	characterId: Numberish;
	linkType: CharacterLinkType;
};

export type UnlinkCharacterOptions = {
	characterId: Numberish;
	linkType: CharacterLinkType;
};

export type LinkCharactersOptions = {
	characterIds?: Numberish[];
	addresses?: Address[];
	linkType: CharacterLinkType;
};

export function linkActions<S extends AccountState>(model: AccountModel<S>) {
	return {
		linkCharacter: accountAction<
			LinkCharacterOptions,
			null | { transactionHash: Address },
			S
		>({ model }, () => ({
			async email({ characterId, linkType }, { account }) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (isLinked) return null;

				return linkCharacter({
					token: account.token,
					toCharacterId: characterId,
					linkType,
				});
			},

			async opSign({ characterId, linkType }, { account, siwe }) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character?.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (isLinked) return null;

				return siweLinkCharacter({
					characterId: account.character.characterId,
					siwe,
					toCharacterId: characterId,
					linkType,
				});
			},

			async contract({ characterId, linkType }, { contract, account }) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (isLinked) return null;

				return contract.link.linkCharacter({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});
			},
		})),

		unlinkCharacter: accountAction<
			UnlinkCharacterOptions,
			null | { transactionHash: Address },
			S
		>({ model }, () => ({
			async email({ characterId, linkType }, { account }) {
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

			async opSign({ characterId, linkType }, { account, siwe }) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (!isLinked) return null;

				return siweUnlinkCharacter({
					characterId: account.character.characterId,
					siwe,
					toCharacterId: characterId,
					linkType,
				});
			},

			async contract({ characterId, linkType }, { account, contract }) {
				const isLinked = await getIsLinked({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType,
				});

				if (!isLinked) return null;

				return contract.link.unlinkCharacter({
					fromCharacterId: account.character.characterId,
					toCharacterId: characterId,
					linkType: linkType,
				});
			},
		})),

		linkCharacters: accountAction<
			LinkCharactersOptions,
			{ transactionHash: Address },
			S
		>({ model }, () => ({
			async email({ characterIds, addresses, linkType }, { account }) {
				return linkCharacters({
					token: account.token,
					toCharacterIds: characterIds ?? [],
					toAddresses: addresses ?? [],
					linkType,
				});
			},

			async opSign({ characterIds, addresses, linkType }, { account, siwe }) {
				return siweLinkCharacters({
					characterId: account.character.characterId,
					siwe,
					toCharacterIds: characterIds ?? [],
					toAddresses: addresses ?? [],
					linkType,
				});
			},

			async contract(
				{ characterIds, addresses, linkType },
				{ contract, account },
			) {
				return contract.link.linkCharactersInBatch({
					fromCharacterId: account.character.characterId,
					toCharacterIds: characterIds ?? [],
					toAddresses: addresses ?? [],
					linkType: linkType,
				});
			},
		})),
	};
}
