import { indexer } from "@crossbell/indexer";

type RequestConfig<T> = {
	method: string;
	body?: Record<string, unknown>;
	token?: string;
	handleResponse?: (res: Response) => T;
	endpoint?: string | null;
};

export function stringify(value: any) {
	return JSON.stringify(value, (_, value) => {
		return typeof value === "bigint" ? value.toString() : value;
	});
}

export function request<T = any>(
	url: `/${string}`,
	{ body, method, token, handleResponse, endpoint }: RequestConfig<T>,
): Promise<T> {
	const headers = new Headers({ "Content-Type": "application/json" });

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	return fetch((endpoint ?? indexer.endpoint).replace(/\/$/g, "") + url, {
		method,
		headers,
		body: body && stringify(body),
	}).then(
		handleResponse ??
			(async (res) => {
				const result = await res.json();

				if (!res.ok) {
					throw new Error(result.message);
				}

				return result;
			}),
	);
}
