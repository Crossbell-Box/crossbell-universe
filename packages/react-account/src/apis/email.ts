import {
	CharacterMetadata,
	LinkItemType,
	NoteMetadata,
	LinkItemNote,
	NoteEntity,
	Numberish,
} from "crossbell";
import { type Address } from "viem";

import { getNewbieVillaEndpoint } from "../endpoints-config";
import { request } from "./utils";

export async function registerSendCodeToEmail(
	email: string,
): Promise<{ ok: boolean; msg: string }> {
	const result = await request("/account/signup/email", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body: { email },
	});

	if (result.ok) {
		return { ok: true, msg: "Email Sent" };
	} else {
		return { ok: false, msg: `${result.message}` };
	}
}

export async function registerVerifyEmailCode(body: {
	email: string;
	code: string;
}): Promise<{ ok: boolean; msg: string }> {
	const result = await request("/account/signup/email/verify", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body,
	});

	if (result.ok) {
		return { ok: true, msg: "Email Sent" };
	} else {
		return { ok: false, msg: `${result.message}` };
	}
}

export async function registerByEmail(body: {
	email: string;
	emailVerifyCode: string;
	password: string;
	characterName: string;
}): Promise<{ ok: boolean; msg: string; token: string }> {
	const result = await request("/account/signup", {
		endpoint: getNewbieVillaEndpoint(),
		method: "PUT",
		body,
	});

	if (result.token) {
		return { ok: true, msg: "Registered", token: result.token };
	} else {
		return { ok: false, msg: `${result.message}`, token: "" };
	}
}

export async function connectByEmail(body: {
	email: string;
	password: string;
}): Promise<{ ok: boolean; msg: string; token: string }> {
	const result = await request("/account/signin", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body,
	});

	if (result.token) {
		return { ok: true, msg: "Connected", token: result.token };
	} else {
		return { ok: false, msg: `${result.message}`, token: "" };
	}
}

export async function resetPasswordSendCodeToEmail(
	email: string,
): Promise<{ ok: boolean; msg: string }> {
	const result = await request("/account/reset-password/email", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body: { email },
	});

	if (result.ok) {
		return { ok: true, msg: "Email Sent" };
	} else {
		return { ok: false, msg: `${result.message}` };
	}
}

export async function resetPasswordVerifyEmailCode(body: {
	email: string;
	code: string;
}): Promise<{ ok: boolean; msg: string }> {
	const result = await request("/account/reset-password/email/verify", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body,
	});

	if (result.ok) {
		return { ok: true, msg: "Email Sent" };
	} else {
		return { ok: false, msg: `${result.message}` };
	}
}

export async function resetPasswordByEmail(body: {
	email: string;
	emailVerifyCode: string;
	password: string;
}): Promise<{ ok: boolean; msg: string }> {
	const result = await request("/account/reset-password", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		body,
	});

	if (result.ok) {
		return { ok: true, msg: "Password reset successful, please login again." };
	} else {
		return { ok: false, msg: `${result.message}` };
	}
}

export type FetchAccountInfoResult =
	| {
			ok: true;
			email: string;
			characterId: number;
			csb: string;
	  }
	| {
			ok: false;
			msg: string;
	  };

export async function fetchAccountInfo(
	token: string,
): Promise<FetchAccountInfoResult> {
	const { email, characterId, message, csb } = await request("/account", {
		method: "GET",
		token,
		endpoint: getNewbieVillaEndpoint(),
	});

	if (email && characterId) {
		return { ok: true, email, characterId, csb };
	} else {
		return { ok: false, msg: message };
	}
}

export async function updateHandle(
	token: string,
	handle: string,
): Promise<{ ok: boolean; msg: string }> {
	return request("/contract/characters/me/handle", {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		token,
		body: { handle },
	});
}

export async function deleteAccount(token: string): Promise<void> {
	return request("/account", {
		endpoint: getNewbieVillaEndpoint(),
		method: "DELETE",
		token,
		body: {},
		handleResponse() {},
	});
}

export async function linkNote({
	token,
	noteId,
	characterId,
	linkType,
	data,
}: {
	token: string;
	characterId: number;
	noteId: number;
	linkType: string;
	data?: string;
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/links/notes/${characterId}/${noteId}/${linkType}`, {
		method: "PUT",
		token,
		body: { data },
		endpoint: getNewbieVillaEndpoint(),
	});
}

export async function unlinkNote({
	token,
	noteId,
	characterId,
	linkType,
}: {
	token: string;
	characterId: number;
	noteId: number;
	linkType: string;
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/links/notes/${characterId}/${noteId}/${linkType}`, {
		method: "DELETE",
		token,
		endpoint: getNewbieVillaEndpoint(),
	});
}

export async function linkCharacter({
	token,
	toCharacterId,
	linkType,
	data,
}: {
	token: string;
	toCharacterId: number;
	linkType: string;
	data?: string;
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/links/characters/${toCharacterId}/${linkType}`, {
		method: "PUT",
		token,
		body: { data },
		endpoint: getNewbieVillaEndpoint(),
	});
}

export async function linkCharacters({
	token,
	toCharacterIds,
	toAddresses,
	linkType,
	data,
}: {
	token: string;
	toCharacterIds: number[];
	toAddresses: string[];
	linkType: string;
	data?: string;
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/links/characters`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "PUT",
		token,
		body: { data, linkType, toCharacterIds, toAddresses },
	});
}

export async function unlinkCharacter({
	token,
	toCharacterId,
	linkType,
}: {
	token: string;
	toCharacterId: number;
	linkType: string;
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/links/characters/${toCharacterId}/${linkType}`, {
		method: "DELETE",
		token,
		endpoint: getNewbieVillaEndpoint(),
	});
}

export async function putNote({
	token,
	...body
}: {
	token: string;
	metadata: NoteMetadata;
	linkItemType?: LinkItemType;
	linkItem?: LinkItemNote;
	locked?: boolean;
}): Promise<{ transactionHash: string; data: { noteId: number } }> {
	return request(`/contract/notes`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "PUT",
		token,
		body,
	});
}

export async function updateNote({
	token,
	noteId,
	metadata,
}: {
	token: string;
	metadata: NoteMetadata;
	noteId: NoteEntity["noteId"];
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/notes/${noteId}/metadata`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		token,
		body: { metadata },
	});
}

export async function deleteNote({
	token,
	noteId,
}: {
	token: string;
	noteId: NoteEntity["noteId"];
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/notes/${noteId}`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "DELETE",
		token,
	});
}

export async function refillBalance({
	token,
}: {
	token: string;
}): Promise<{ balance: string } | { ok: boolean; message: string }> {
	return request(`/account/balance/refill`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		token,
		body: {},
	});
}

export async function updateCharactersMetadata({
	token,
	metadata,
	mode = "merge",
}: {
	token: string;
	metadata: CharacterMetadata;
	mode?: "merge" | "replace";
}): Promise<{ transactionHash: string; data: string }> {
	return request(`/contract/characters/me/metadata`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		token,
		body: { metadata, mode },
	});
}

export function getWithdrawProof({
	token,
}: {
	token: string;
}): Promise<{ proof: Address; nonce: number; expires: number }> {
	return request(`/account/withdraw/proof`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "GET",
		token,
	});
}

export function emailTip({
	token,
	...body
}: {
	token: string;
	characterId: Numberish;
	noteId?: Numberish;
	amount: bigint;
}): Promise<{ transactionHash: string; data: boolean }> {
	return request(`/contract/tips`, {
		endpoint: getNewbieVillaEndpoint(),
		method: "POST",
		token,
		body,
	});
}
