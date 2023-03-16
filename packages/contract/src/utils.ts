import { Contract } from "crossbell.js";
import { BigNumber, utils } from "ethers";

import { getCsbBalance } from "@crossbell/indexer";

import { BizError, ERROR_CODES } from "./errors";

export type InjectContractCheckerConfig = {
	contract: Contract;
	getCurrentCharacterId: () => number | null;
	getCurrentAddress: () => string | null;
	openFaucetHintModel: () => void;
	openMintNewCharacterModel: () => void;
	openConnectModal: () => void;
};

export function injectContractChecker({
	contract,
	getCurrentCharacterId,
	getCurrentAddress,
	openConnectModal,
	openFaucetHintModel,
	openMintNewCharacterModel,
}: InjectContractCheckerConfig) {
	return new Proxy(contract, {
		get: (target, prop) => {
			return async (...args: any[]) => {
				if (needValidate(prop)) {
					const address = getCurrentAddress();

					if (address) {
						// check if $CSB is enough to pay for the transaction
						const balance = await getCsbBalance(address);
						if (!hasEnoughCsb(balance)) {
							openFaucetHintModel();
							throw new BizError("Not enough $CSB.", ERROR_CODES.NO_CHARACTER);
						}
					} else {
						// user is not logged in
						openConnectModal?.();
						throw new BizError(
							"Not connected. Please connect your wallet.",
							ERROR_CODES.NOT_CONNECTED
						);
					}

					// check if the wallet has any character
					if (needCheckCharacter(prop) && !getCurrentCharacterId()) {
						openMintNewCharacterModel();
						throw new BizError(
							"You don't have a character yet",
							ERROR_CODES.NO_CHARACTER
						);
					}
				}

				return (target as any)[prop]?.(...args);
			};
		},
	});
}

function needCheckCharacter(key: string | symbol) {
	const whitelist: (string | symbol)[] = ["createCharacter"];

	return !whitelist.includes(key);
}

function needValidate(key: string | symbol) {
	if (typeof key === "string") {
		return !(key === "then" || key.startsWith("get"));
	}

	return true;
}

function hasEnoughCsb(amount: BigNumber) {
	const threshold = utils.parseEther("0.0001");
	return amount.gte(threshold);
}
