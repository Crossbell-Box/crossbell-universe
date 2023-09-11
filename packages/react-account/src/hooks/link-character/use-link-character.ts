import type { CrossbellModel } from "@crossbell/store";
import type { CharacterLinkType } from "@crossbell/indexer";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useCrossbellModel } from "../crossbell-model";

export type LinkCharacterVariables = Omit<
	Parameters<CrossbellModel["link"]["linkCharacter"]>[0],
	"linkType"
>;

export type LinkCharacterResult = Awaited<
	ReturnType<CrossbellModel["link"]["linkCharacter"]>
>;

export type LinkCharacterOptions = UseMutationOptions<
	LinkCharacterResult,
	unknown,
	LinkCharacterVariables
>;

export const useLinkCharacter = (
	linkType: CharacterLinkType,
	options?: LinkCharacterOptions,
) => {
	const model = useCrossbellModel();

	return useMutation(
		(o) => model.link.linkCharacter({ ...o, linkType }),
		options,
	);
};
