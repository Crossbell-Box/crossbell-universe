import { OrchModel, mutation } from "@orch/core";
import type { CharacterEntity, Indexer, Contract } from "crossbell";
import type { Address } from "viem";

import { indexer } from "@crossbell/indexer";

import { getAddressMiraBalance } from "../../apis";
import { BaseAccount, BaseSigner } from "../../types";
import { csbToBalance } from "../../utils";
import { SiweState, siweActions, SiweInfo } from "./siwe";

export interface WalletAccount extends BaseAccount<"wallet"> {
	address: Address;
	siwe: SiweInfo | null;
}

export type WalletState = SiweState & { wallet: WalletAccount | null };

export type WalletActionsDelegate = {
	getIndexer: () => Indexer;
	getContract: () => Contract;
};

export function walletActions<T extends WalletState>(
	model: OrchModel<T>,
	delegate: WalletActionsDelegate,
) {
	const siwe_ = siweActions(model);

	const disconnect = mutation(model, (state) => {
		state.wallet = null;
	});

	const connect = (() => {
		const update = mutation(
			model,
			(state, account: Omit<WalletAccount, "type">) => {
				state.wallet = { type: "wallet", ...account };
			},
		);

		return async (address: Address) => {
			const { wallet } = model.getState();
			const isSameAddress = wallet?.address === address;
			const [mira, balance, character, siwe] = await Promise.all([
				getAddressMiraBalance({
					address,
					contract: delegate.getContract(),
				}),

				getAddressBalance({
					address,
					contract: delegate.getContract(),
				}),

				getDefaultCharacter({
					address,
					characterId: isSameAddress ? wallet.character?.characterId : null,
				}),

				siwe_.refresh(address),
			]);

			update({ address, balance, character, siwe, mira });
		};
	})();

	const refresh = async () => {
		const { wallet } = model.getState();

		if (wallet?.address) {
			await connect(wallet.address);
		}
	};

	const switchCharacter = mutation(
		model,
		(state, character: CharacterEntity) => {
			if (state.wallet) {
				state.wallet.character = character;
			}
		},
	);

	const signIn = (() => {
		const update = mutation(model, (state, siweInfo: SiweInfo | null) => {
			if (state.wallet) {
				state.wallet.siwe = siweInfo;
			}
		});

		return async (signer: BaseSigner) => {
			const address = model.getState().wallet?.address;

			if (!address) {
				throw new Error(`SignInError: invalid address ${address}`);
			}

			update(await siwe_.signIn(address, signer));
		};
	})();

	return { disconnect, connect, refresh, switchCharacter, signIn };
}

async function getDefaultCharacter({
	address,
	characterId,
}: {
	address: Address;
	characterId?: number | null;
}): Promise<CharacterEntity | null> {
	const character = await (characterId
		? indexer.character.get(characterId)
		: indexer.character.getPrimary(address));

	return (
		character ?? (await indexer.character.getMany(address)).list[0] ?? null
	);
}

async function getAddressBalance({
	address,
	contract,
}: {
	address: Address;
	contract: Contract;
}) {
	return contract.csb
		.getBalance({ owner: address })
		.then(({ data }) => csbToBalance(data));
}
