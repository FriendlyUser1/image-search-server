import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	root: __dirname,
	base: "./",
	plugins: [react()],
	build: {
		outDir: "../public",
		emptyOutDir: false,
		rollupOptions: {
			input: {
				dashboard: "src/dashboard.html",
			},
		},
	},
	server: {
		port: 9000,
		proxy: {
			"/api": { secure: false, target: "https://localhost/" },
		},
	},
});
