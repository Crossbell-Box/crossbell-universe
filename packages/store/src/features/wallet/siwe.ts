import { OrchModel, mutation } from "@orch/core";
import { isAddressEqual, type Address } from "viem";

import { siweGetAccount, siweGetBalance, siweSignIn } from "../../apis";
import type { BaseSigner } from "../../types";

export type SiweInfo = { csb: string; token: string };

export type SiweState = {
	_siwe: Record<Address, SiweInfo | null>;
};

export function siweActions<T extends SiweState>(model: OrchModel<T>) {
	const update = mutation(
		model,
		(state, address: Address, info: SiweInfo | null) => {
			state._siwe[address] = info;
		},
	);

	const getInfo = (address: Address) => model.getState()._siwe[address];

	const refresh = async (address: Address, token_?: string) => {
		const token = token_ ?? getInfo(address)?.token;

		if (!address || !token) return null;

		const siwe = await fetchSiweInfo({ token, address });

		update(address, siwe);

		return siwe;
	};

	const signIn = async (address: Address, signer: BaseSigner) => {
		const { token } = await siweSignIn(address, signer);

		return await refresh(address, token);
	};

	return {
		update,
		getInfo,
		refresh,
		signIn,
	};
}

async function fetchSiweInfo({
	address,
	token,
}: {
	address: Address;
	token: string;
}): Promise<SiweInfo | null> {
	if (!token) return null;

	const [account, { balance: csb }] = await Promise.all([
		siweGetAccount({ token }),
		siweGetBalance({ token }),
	]);

	if (csb && isAddressEqual(account.address, address)) {
		return { token, csb };
	} else {
		return null;
	}
}
