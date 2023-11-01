import { proxy } from "valtio";
import {
	opSignConfig,
	type OpSignConfig,
} from "./hooks/operator-sign/op-sign-config";

// NewbieVilla

const newbieVillaConfig = proxy({
	endpoint: "https://newbie.crossbell.io/v1/",
});

export function getNewbieVillaEndpoint() {
	return newbieVillaConfig.endpoint;
}

export function setNewbieVillaEndpoint(endpoint: string) {
	newbieVillaConfig.endpoint = endpoint;
}

// OpSign

export function getOpSignEndpoint() {
	return opSignConfig?.endpoint ?? null;
}

export function getOpSignAddress() {
	return opSignConfig?.address ?? null;
}

export function setOpSignEndpoint({ endpoint, address }: OpSignConfig) {
	opSignConfig.endpoint = endpoint;
	opSignConfig.address = address;
}
