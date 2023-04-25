import { SliceFn } from "@crossbell/react-account/utils";

export interface ScenesSlice<S> {
	scenes: S[];
	goTo: (scene: S) => void;
	goBack: () => void;
	updateLast: (scene: S) => void;
	reset: () => void;
	resetScenes: (scenes: S[]) => void;

	computed: {
		currentScene: S;
		isAbleToGoBack: boolean;
	};
}

export type SceneType<K, Context = unknown> = {
	kind: K;
} & Context;

export const scenesSlice =
	<S>(defaultScene: S): SliceFn<ScenesSlice<S>> =>
	(set, get) => ({
		scenes: [defaultScene],

		goTo(scene) {
			set({ scenes: [...get().scenes, scene] });
		},

		goBack() {
			const { scenes } = get();

			set({ scenes: scenes.slice(0, scenes.length - 1) });
		},

		updateLast(scene) {
			const { scenes } = get();

			set({ scenes: [...scenes.slice(0, scenes.length - 1), scene] });
		},

		reset() {
			set({ scenes: [defaultScene] });
		},

		resetScenes(scenes) {
			set({ scenes });
		},

		computed: {
			get currentScene() {
				const { scenes } = get();
				return scenes[scenes.length - 1];
			},

			get isAbleToGoBack() {
				const { scenes } = get();
				return scenes.length > 1;
			},
		},
	});
