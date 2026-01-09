import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	build: {
		outDir: "../backend/static/build",
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, "src/main.js"),
			output: {
				entryFileNames: "main.js",
				assetFileNames: "[name][extname]",
			},
		},
	},
});
