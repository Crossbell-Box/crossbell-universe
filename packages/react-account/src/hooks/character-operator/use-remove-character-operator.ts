import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from "@tanstack/react-query";
import { CrossbellModel } from "@crossbell/store";

import { useCrossbellModel } from "../crossbell-model";
import {
	GET_CHARACTER_OPERATORS_SCOPE_KEY,
	SCOPE_KEY_CHARACTER_OPERATOR,
} from "./const";

export type UseRemoveCharacterOperatorOptions = Parameters<
	CrossbellModel["operator"]["remove"]
>[0];

export type UseRemoveCharacterOperatorResult = Awaited<
	ReturnType<CrossbellModel["operator"]["remove"]>
>;

export function useRemoveCharacterOperator(
	options?: UseMutationOptions<
		UseRemoveCharacterOperatorResult,
		unknown,
		UseRemoveCharacterOperatorOptions
	>,
) {
	const model = useCrossbellModel();
	const queryClient = useQueryClient();

	return useMutation(model.operator.remove, {
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
