import { OrchModel, mutation } from "@orch/core";

import { StateStorage } from "../storage";

export type PersistConfig = {
	key: string;
	storage: StateStorage | null;
};

export function persist<S>(model: OrchModel<S>, config: PersistConfig) {
	autoSave(model, config);
	restore(model, config);
}

function restore<S>(model: OrchModel<S>, { storage, key }: PersistConfig) {
	const unsubscribe = model.on.activate(() => {
		unsubscribe();

		const item = storage?.getItem(key);
		const setState = mutation(
			model,
			(current, next: S | null) => next ?? current,
		);

		if (!item) return;

		if (item instanceof Promise) {
			item.then<S | null>(parse).then(setState);
		} else {
			setState(parse(item));
		}
	});
}

function autoSave<S>(model: OrchModel<S>, { storage, key }: PersistConfig) {
	model.on.change((value) => storage?.setItem(key, stringify(value)));
}

function parse<T>(str: string | null): T | null {
	if (!str) return null;

	return JSON.parse(str, (_, value) => {
		if (value && value.__type === "bigint") {
			return BigInt(value.value);
		} else {
			return value;
		}
	});
}

function stringify(data: any) {
	return JSON.stringify(data, (_, value) => {
		if (typeof value === "bigint") {
			return {
				__type: "bigint",
				value: value.toString(),
			};
		} else {
			return value;
		}
	});
}
