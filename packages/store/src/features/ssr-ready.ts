import { OrchModel, mutation } from "@orch/core";

export type SSRReadyState = {
	ssrReady: boolean;
};

export function markSSRReady<S extends SSRReadyState>(model: OrchModel<S>) {
	const markAsReady = mutation(model, (state) => {
		state.ssrReady = true;
	});

	model.on.activate(markAsReady);
}
