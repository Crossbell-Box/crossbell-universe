export type StateStorage = {
	getItem: (name: string) => string | null | Promise<string | null>;
	setItem: (name: string, value: string) => void | Promise<void>;
	removeItem: (name: string) => void | Promise<void>;
};

let _getStorage = (): StateStorage => localStorage;

export function setupStorage(storage: StateStorage) {
	_getStorage = () => storage;
}

export function getStorage() {
	return _getStorage();
}
