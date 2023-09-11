import { CrossbellModel } from "@crossbell/store";
import type { CharacterLinkType } from "@crossbell/indexer";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useCrossbellModel } from "../crossbell-model";

export type LinkCharactersVariables = Omit<
	Parameters<CrossbellModel["link"]["linkCharacters"]>[0],
	"linkType"
>;

export type LinkCharactersResult = Awaited<
	ReturnType<CrossbellModel["link"]["linkCharacters"]>
>;

export type LinkCharactersOptions = UseMutationOptions<
	LinkCharactersResult,
	unknown,
	LinkCharactersVariables
>;

export function useLinkCharacters(
	linkType: CharacterLinkType,
	options?: LinkCharactersOptions,
) {
	const model = useCrossbellModel();

	return useMutation(
		(o) => model.link.linkCharacters({ ...o, linkType }),
		options,
	);
}
