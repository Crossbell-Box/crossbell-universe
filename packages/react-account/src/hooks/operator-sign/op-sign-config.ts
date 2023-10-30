import { Address } from "viem";
import { proxy } from "valtio";

export type OpSignConfig = {
	endpoint: string;
	address: Address;
};

export const opSignConfig = proxy<OpSignConfig>({
	endpoint: "https://indexer.crossbell.io/v1/siwe/",
	address: "0xbbc2918c9003d264c25ecae45b44a846702c0e7c",
});
