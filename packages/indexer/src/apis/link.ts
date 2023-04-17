import { indexer } from "../indexer";
import { useQuery } from "@tanstack/react-query";

const SCOPE_KEY = ["indexer", "links"];

// get links

export const SCOPE_KEY_LINKS = (
	characterId: number,
	options: Parameters<(typeof indexer)["getLinks"]>[1]
) => {
	return [...SCOPE_KEY, "list", characterId, options];
};
export function useLinks(
	characterId: number,
	options: Parameters<(typeof indexer)["getLinks"]>[1]
) {
	return (
		useQuery(SCOPE_KEY_LINKS(characterId, options), () =>
			indexer.getLinks(characterId, options)
		),
		{ enabled: Boolean(characterId) }
	);
}
