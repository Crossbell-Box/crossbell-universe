import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: true,
	entry: {
		index: "src/index.ts",
		utils: "src/utils/index.ts",
		apis: "src/apis/index.ts",
	},
	outDir: "dist",
	format: ["cjs", "esm"],
	minify: true,
	treeshake: true,
	tsconfig: "tsconfig.json",
	splitting: true,
	sourcemap: true,
});
