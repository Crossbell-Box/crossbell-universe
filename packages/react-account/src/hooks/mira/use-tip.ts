import type { CrossbellModel } from "@crossbell/store";
import {
	useMutation,
	useQueryClient,
	type UseMutationOptions,
} from "@tanstack/react-query";

import { useCrossbellModel } from "../crossbell-model";
import { SCOPE_KEY_TIPS_LIST } from "./use-tip-list";

export type UseTipOptions = Parameters<CrossbellModel["tips"]["send"]>[0];
export type UseTipResult = Awaited<ReturnType<CrossbellModel["tips"]["send"]>>;

export function useTip(
	mutationOptions?: UseMutationOptions<UseTipResult, unknown, UseTipOptions>,
) {
	const model = useCrossbellModel();
	const queryClient = useQueryClient();

	return useMutation((options) => model.tips.send(options), {
		...mutationOptions,

		onSuccess(...params) {
			const { characterId, noteId } = params[1];

			return Promise.all([
				mutationOptions?.onSuccess?.(...params),

				queryClient.invalidateQueries(
					SCOPE_KEY_TIPS_LIST({
						toCharacterId: characterId,
						toNoteId: noteId,
						characterId: model.getCurrentCharacterId(),
					}),
				),
			]);
		},
	});
}
