import { Contract, Numberish } from "crossbell";
import { isCrossbellMainnet } from "crossbell/network";
import { parseEther, type Address } from "viem";

import { handleActions } from "../../utils";
import { BizError, ERROR_CODES } from "./errors";

export type ContractCheckerDelegate = {
	openFaucetHintModel: () => void;
	openMintNewCharacterModel: () => void;
	openConnectModal: () => void;
	showSwitchNetworkModal: (contract: Contract) => Promise<void>;
};

export type InjectContractCheckerOptions = {
	getCurrentCharacterId: () => number | null;
	getCurrentAddress: () => Address | null;
	delegate: ContractCheckerDelegate;
};

export function injectContractChecker(
	contract: Contract,
	{
		getCurrentCharacterId,
		getCurrentAddress,
		delegate,
	}: InjectContractCheckerOptions,
) {
	return handleActions(contract, async ({ action, path }) => {
		if (needValidate(path)) {
			await checkNetwork(contract, delegate.showSwitchNetworkModal);

			const address = getCurrentAddress();

			if (address) {
				// check if $CSB is enough to pay for the transaction
				const { data: balance } = await contract.csb.getBalance({
					owner: address,
				});

				if (!hasEnoughCsb(balance)) {
					delegate.openFaucetHintModel();
					throw new BizError("Not enough $CSB.", ERROR_CODES.NO_CHARACTER);
				}
			} else {
				// user is not logged in
				delegate.openConnectModal?.();
				throw new BizError(
					"Not connected. Please connect your wallet.",
					ERROR_CODES.NOT_CONNECTED,
				);
			}

			// check if the wallet has any character
			if (needCheckCharacter(path) && !getCurrentCharacterId()) {
				delegate.openMintNewCharacterModel();
				throw new BizError(
					"You don't have a character yet",
					ERROR_CODES.NO_CHARACTER,
				);
			}
		}

		return action();
	});
}

function needCheckCharacter(path: (string | symbol)[]) {
	const key = path.map(String).join(".");

	const whitelist = ["character.create"];

	return key ? !whitelist.includes(key) : false;
}

function needValidate(path: (string | symbol)[]) {
	const key = lastOne(path);

	if (typeof key === "string") {
		return !(key === "then" || key.startsWith("get"));
	}

	return true;
}

function hasEnoughCsb(amount: Numberish) {
	const threshold = parseEther("0.0001");
	return BigInt(amount) >= threshold;
}

async function checkNetwork(
	contract: Contract<true>,
	showModal: ContractCheckerDelegate["showSwitchNetworkModal"],
) {
	const isMainnet = await isCrossbellMainnet(contract.walletClient);

	if (!isMainnet) {
		await showModal?.(contract);
	}
}

function lastOne<T>(list: T[]): T | undefined {
	return list[list.length - 1];
}
