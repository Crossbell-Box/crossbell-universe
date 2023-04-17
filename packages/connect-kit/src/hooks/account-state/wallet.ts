import { CharacterEntity } from "crossbell.js";
import { Signer } from "ethers";
import { indexer } from "@crossbell/indexer";

import { isAddressEqual } from "@crossbell/util-ethers";

import { asyncExhaust, SliceFn } from "../../utils";
import { siweGetAccount, siweGetBalance, siweSignIn } from "../../apis";

export type SiweInfo = {
	csb: string;
	token: string;
};

export type WalletAccount = {
	type: "wallet";
	character: CharacterEntity | undefined;
	characterId: number | undefined;
	handle: string | undefined;
	address: string;
	siwe: SiweInfo | null;
};

export type WalletAccountSlice = {
	wallet: WalletAccount | null;

	_siweCache: Record<WalletAccount["address"], SiweInfo | null>;

	connectWallet(address: string | null): Promise<boolean>;
	disconnectWallet(): void;
	refreshWallet(): Promise<boolean>;
	switchCharacter(character: CharacterEntity): void;

	siweSignIn(signer: Signer): Promise<boolean>;
};

export const createWalletAccountSlice: SliceFn<WalletAccountSlice> = (
	set,
	get
) => {
	const updateSiwe = (params: { address: string; siwe: SiweInfo | null }) => {
		const { _siweCache, wallet } = get();

		set({
			wallet:
				wallet?.address === params.address
					? { ...wallet, siwe: params.siwe }
					: wallet,
			_siweCache: {
				..._siweCache,
				[params.address]: params.siwe,
			},
		});
	};

	const getSiwe = (params: { address: string }): SiweInfo | null => {
		const { _siweCache } = get();

		return _siweCache[params.address] ?? null;
	};

	const refreshSiwe = async (params: {
		address: string;
		token?: string;
	}): Promise<SiweInfo | null> => {
		const address = params.address;
		const token = params.token ?? getSiwe(params)?.token;

		if (!address || !token) return null;

		const siwe = await getSiweInfo({ token, address });

		updateSiwe({ address, siwe });

		return siwe;
	};

	return {
		wallet: null,

		_siweCache: {},

		connectWallet: asyncExhaust(async (address) => {
			if (address) {
				const { wallet } = get();
				const isSameAddress = wallet?.address === address;
				const preferredCharacterId = isSameAddress ? wallet?.characterId : null;
				const [character, siwe] = await Promise.all([
					getDefaultCharacter({ address, characterId: preferredCharacterId }),
					refreshSiwe({ address }),
				]);

				if (character) {
					set({
						wallet: {
							siwe,
							address,
							type: "wallet",
							handle: character.handle,
							characterId: character.characterId,
							character,
						},
					});
					return true;
				} else {
					set({
						wallet: {
							siwe,
							address,
							type: "wallet",
							handle: undefined,
							characterId: undefined,
							character: undefined,
						},
					});
					return false;
				}
			} else {
				get().disconnectWallet();
				return false;
			}
		}),

		disconnectWallet() {
			set({ wallet: null, _siweCache: {} });
		},

		async refreshWallet() {
			const { wallet } = get();

			if (wallet?.address) {
				return get().connectWallet(wallet.address);
			} else {
				return false;
			}
		},

		switchCharacter(character: CharacterEntity) {
			const { wallet } = get();

			if (wallet?.address) {
				set({
					wallet: {
						siwe: wallet.siwe,
						address: wallet.address,
						type: "wallet",
						handle: character.handle,
						characterId: character.characterId,
						character,
					},
				});
			}

			return true;
		},

		async siweSignIn(signer) {
			const address = get().wallet?.address;

			if (address) {
				const { token } = await siweSignIn(signer);

				if (token) {
					return !!(await refreshSiwe({ address, token }));
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
	};
};

async function getSiweInfo({
	address,
	token,
}: {
	address: string;
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

async function getDefaultCharacter({
	address,
	characterId,
}: {
	address: string;
	characterId?: number | null;
}): Promise<CharacterEntity | null> {
	const character = await (characterId
		? indexer.getCharacter(characterId)
		: indexer.getPrimaryCharacter(address));

	return character ?? (await indexer.getCharacters(address)).list[0] ?? null;
}
