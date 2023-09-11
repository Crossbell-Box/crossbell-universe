import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { CrossbellModel } from "@crossbell/store";
import type { CharacterLinkType } from "@crossbell/indexer";

import { useCrossbellModel } from "../crossbell-model";

export type UnlinkCharacterVariables = Omit<
	Parameters<CrossbellModel["link"]["unlinkCharacter"]>[0],
	"linkType"
>;

export type UnlinkCharacterResult = Awaited<
	ReturnType<CrossbellModel["link"]["unlinkCharacter"]>
>;

export type UnlinkCharacterOptions = UseMutationOptions<
	UnlinkCharacterResult,
	unknown,
	UnlinkCharacterVariables
>;

export function useUnlinkCharacter(
	linkType: CharacterLinkType,
	options?: UnlinkCharacterOptions,
) {
	const model = useCrossbellModel();

	return useMutation(
		(o) => model.link.unlinkCharacter({ ...o, linkType }),
		options,
	);
}
