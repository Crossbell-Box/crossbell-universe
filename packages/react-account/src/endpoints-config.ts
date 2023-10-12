import { proxy } from "valtio";

// NewbieVilla
const newbieVillaConfig = proxy({
	endpoint: "https://indexer.crossbell.io/v1/newbie",
});

export function getNewbieVillaEndpoint() {
	return newbieVillaConfig.endpoint;
}

export function setNewbieVillaEndpoint(endpoint: string) {
	newbieVillaConfig.endpoint = endpoint;
}
