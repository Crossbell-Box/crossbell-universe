import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import type { Numberish } from "crossbell";

import {
	CharacterLinkType,
	SCOPE_KEY_CHARACTER_FOLLOW_RELATION,
	SCOPE_KEY_CHARACTER_FOLLOW_STATS,
} from "@crossbell/indexer";

import { useCrossbellModelState } from "../crossbell-model";

import { useLinkCharacter, LinkCharacterOptions } from "./use-link-character";
import {
	useUnlinkCharacter,
	UnlinkCharacterOptions,
} from "./use-unlink-character";
import {
	useLinkCharacters,
	LinkCharactersOptions,
} from "./use-link-characters";

export function useFollowCharacter(_options?: LinkCharacterOptions) {
	const queryClient = useQueryClient();
	const currentCharacterId = useCrossbellModelState(
		(_, m) => m.getCurrentCharacterId(),
		[],
	);

	const options: LinkCharacterOptions = React.useMemo(
		() => ({
			..._options,

			onSuccess: (...params) => {
				const { characterId } = params[1];

				return Promise.all([
					_options?.onSuccess?.(...params),

					...invalidateQueries({
						queryClient,
						characterId,
						currentCharacterId,
					}),
				]);
			},
		}),
		[_options, queryClient, currentCharacterId],
	);

	return useLinkCharacter(CharacterLinkType.follow, options);
}

export function useFollowCharacters(_options?: LinkCharactersOptions) {
	const queryClient = useQueryClient();
	const currentCharacterId = useCrossbellModelState(
		(_, m) => m.getCurrentCharacterId(),
		[],
	);

	const options: LinkCharactersOptions = React.useMemo(
		() => ({
			..._options,

			onSuccess: (...params) => {
				const { characterIds = [] } = params[1];

				return Promise.all([
					_options?.onSuccess?.(...params),

					...characterIds.flatMap((characterId) =>
						invalidateQueries({
							queryClient,
							characterId,
							currentCharacterId,
						}),
					),
				]);
			},
		}),
		[_options, queryClient, currentCharacterId],
	);

	return useLinkCharacters(CharacterLinkType.follow, options);
}

export function useUnfollowCharacter(_options?: UnlinkCharacterOptions) {
	const queryClient = useQueryClient();
	const currentCharacterId = useCrossbellModelState(
		(_, m) => m.getCurrentCharacterId(),
		[],
	);

	const options: UnlinkCharacterOptions = React.useMemo(
		() => ({
			..._options,

			onSuccess: (...params) => {
				const { characterId } = params[1];

				return Promise.all([
					_options?.onSuccess?.(...params),

					...invalidateQueries({
						queryClient,
						characterId,
						currentCharacterId,
					}),
				]);
			},
		}),
		[_options, queryClient, currentCharacterId],
	);

	return useUnlinkCharacter(CharacterLinkType.follow, options);
}

function invalidateQueries({
	queryClient,
	characterId,
	currentCharacterId,
}: {
	queryClient: ReturnType<typeof useQueryClient>;
	currentCharacterId: Numberish | undefined;
	characterId: Numberish;
}) {
	return [
		queryClient.invalidateQueries(
			SCOPE_KEY_CHARACTER_FOLLOW_RELATION(currentCharacterId, characterId),
		),
		queryClient.invalidateQueries(
			SCOPE_KEY_CHARACTER_FOLLOW_STATS(characterId),
		),
	];
}
