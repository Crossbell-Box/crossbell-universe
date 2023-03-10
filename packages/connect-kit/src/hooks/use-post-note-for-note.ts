import { NoteEntity, NoteMetadata } from "crossbell.js";
import {
	SCOPE_KEY_NOTES_OF_NOTE,
	SCOPE_KEY_NOTE_STATUS,
} from "@crossbell/indexer";

import { putNote, siwePutNote } from "../apis";

import { createAccountTypeBasedMutationHooks } from "./account-type-based-hooks";

export const usePostNoteForNote = createAccountTypeBasedMutationHooks<
	void,
	{
		note: Pick<NoteEntity, "characterId" | "noteId">;
		metadata: NoteMetadata;
	},
	boolean
>(
	{
		actionDesc: "",
		withParams: false,
	},
	() => ({
		async email({ metadata, note }, { account }) {
			await putNote({
				token: account.token,
				metadata,
				linkItemType: "Note",
				linkItem: { characterId: note.characterId, noteId: note.noteId },
			});

			return true;
		},

		async contract({ metadata, note }, { account, siwe, contract }) {
			if (account?.characterId) {
				if (siwe) {
					await siwePutNote({
						characterId: account.characterId,
						siwe,
						metadata,
						linkItemType: "Note",
						linkItem: { characterId: note.characterId, noteId: note.noteId },
					});
				} else {
					await contract.postNoteForNote(
						account.characterId,
						metadata,
						note.characterId,
						note.noteId
					);
				}

				return true;
			} else {
				return false;
			}
		},

		onSuccess({ variables, queryClient }) {
			const { note } = variables;

			return Promise.all([
				queryClient.invalidateQueries(
					SCOPE_KEY_NOTES_OF_NOTE(note.characterId, note.noteId)
				),
				queryClient.invalidateQueries(
					SCOPE_KEY_NOTE_STATUS(note.characterId, note.noteId)
				),
			]);
		},
	})
);
