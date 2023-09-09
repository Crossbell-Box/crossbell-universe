import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from "@tanstack/react-query";
import type { CrossbellModel } from "@crossbell/store";

import { useCrossbellModel } from "../crossbell-model";
import {
	GET_CHARACTER_OPERATORS_SCOPE_KEY,
	SCOPE_KEY_CHARACTER_OPERATOR,
} from "./const";

export type UseAddCharacterOperatorOptions = Parameters<
	CrossbellModel["operator"]["add"]
>[0];

export type UseAddCharacterOperatorResult = Awaited<
	ReturnType<CrossbellModel["operator"]["add"]>
>;

export function useAddCharacterOperator(
	options?: UseMutationOptions<
		UseAddCharacterOperatorResult,
		unknown,
		UseAddCharacterOperatorOptions
	>,
) {
	const model = useCrossbellModel();
	const queryClient = useQueryClient();

	return useMutation(model.operator.add, {
		...options,

		onSuccess(...params) {
			const variables = params[1];

			return Promise.all([
				options?.onSuccess?.(...params),
				queryClient.invalidateQueries(SCOPE_KEY_CHARACTER_OPERATOR(variables)),
				queryClient.invalidateQueries(
					GET_CHARACTER_OPERATORS_SCOPE_KEY(variables),
				),
			]);
		},
	});
}
