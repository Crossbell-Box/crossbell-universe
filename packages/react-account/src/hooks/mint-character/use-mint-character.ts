import { useCrossbellModel } from "@crossbell/react-account";
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from "@tanstack/react-query";
import { CrossbellModel } from "@crossbell/store";
import {
	SCOPE_KEY_CHARACTER,
	SCOPE_KEY_CHARACTER_BY_HANDLE,
	SCOPE_KEY_CHARACTERS,
	SCOPE_KEY_PRIMARY_CHARACTER,
} from "@crossbell/indexer";

export type UseMintCharacterVariables = Parameters<
	CrossbellModel["character"]["create"]
>[0];

export type UseMintCharacterResult = Awaited<
	ReturnType<CrossbellModel["character"]["create"]>
>;

export type UseMintCharacterOptions = UseMutationOptions<
	UseMintCharacterResult,
	unknown,
	UseMintCharacterVariables
>;

export function useMintCharacter(options?: UseMintCharacterOptions) {
	const model = useCrossbellModel();
	const queryClient = useQueryClient();

	return useMutation(model.character.create, {
		...options,
		onSuccess(...params) {
			const character = params[0];
			const address = character?.owner;

			return Promise.all([
				options?.onSuccess?.(...params),
				queryClient.invalidateQueries(
					SCOPE_KEY_CHARACTER(character?.characterId),
				),
				queryClient.invalidateQueries(SCOPE_KEY_CHARACTERS(address)),
				queryClient.invalidateQueries(SCOPE_KEY_PRIMARY_CHARACTER(address)),
				queryClient.invalidateQueries(
					SCOPE_KEY_CHARACTER_BY_HANDLE(character?.handle),
				),
			]);
		},
	});
}
