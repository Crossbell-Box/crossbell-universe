import { OrchModel, mutation } from "@orch/core";
import type { CharacterEntity, Indexer, Contract } from "crossbell";
import type { Address } from "viem";

import { indexer } from "@crossbell/indexer";

import { AccountBalance, BaseSigner } from "../../types";
import { csbToBalance } from "../../utils";
import { SiweState, siweActions, SiweInfo } from "./siwe";

export type WalletAccount = {
	type: "wallet";
	character: CharacterEntity | null;
	balance: AccountBalance;
	address: Address;
	siwe: SiweInfo | null;
};

export type WalletState = SiweState & { wallet: WalletAccount | null };

export type WalletActionsParams = {
	indexer: Indexer;
	contract: Contract;
};

export function walletActions<T extends WalletState>(
	model: OrchModel<T>,
	{ contract }: WalletActionsParams,
) {
	const siwe = siweActions(model);

	const disconnect = mutation(model, (state) => {
		state.wallet = null;
	});

	const connect = (() => {
		const update = mutation(
			model,
			(
				state,
				address: Address,
				balance: AccountBalance,
				character: CharacterEntity | null,
				siwe: SiweInfo | null,
			) => {
				state.wallet = {
					address,
					character,
					type: "wallet",
					siwe: siwe,
					balance,
				};
			},
		);

		return async (address: Address) => {
			const { wallet } = model.getState();
			const isSameAddress = wallet?.address === address;

			update(
				address,
				...(await Promise.all([
					getAddressBalance(address, contract),

					getDefaultCharacter({
						address,
						characterId: isSameAddress ? wallet.character?.characterId : null,
					}),

					siwe.refresh(address),
				])),
			);
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
			update(await siwe.signIn(signer));
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

async function getAddressBalance(address: Address, contract: Contract) {
	return contract.csb
		.getBalance({ owner: address })
		.then(({ data }) => csbToBalance(data));
}
