import { useInfiniteQuery } from "@tanstack/react-query";

import { getMiraTips, GetMiraTipsParams } from "@crossbell/store/apis";
import { useContract } from "../use-contract";

export type UseTipListParams = Omit<GetMiraTipsParams, "cursor">;

export const SCOPE_KEY_TIPS_LIST = ({
	characterId,
	toCharacterId,
	toNoteId,
}: Pick<UseTipListParams, "characterId" | "toCharacterId" | "toNoteId">) => [
	"crossbell",
	"connect-kit",
	"tips-list",
	characterId,
	toCharacterId,
	toNoteId,
];

export function useTipList(params: UseTipListParams) {
	const contract = useContract();

	return useInfiniteQuery(
		SCOPE_KEY_TIPS_LIST(params),
		({ pageParam }) =>
			getMiraTips(contract, {
				cursor: pageParam,
				limit: 20,
				includeMetadata: true,
				...params,
			}),
		{
			enabled: !!params.toCharacterId,
			getNextPageParam: (lastPage) => lastPage.cursor,
		},
	);
}
