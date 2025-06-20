import { defineConfig } from "vite"

export default defineConfig({
	server: {
		proxy: {
			"/api": {
				target: "https://vj.adriencarpentier.com",
				changeOrigin: true,
				secure: true,
			},
		},
	},
	preview: {
		port: 4173,
		host: "0.0.0.0",
	},
	build: {
		assetsDir: "assets",
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name]-[hash][extname]",
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
			},
		},
	},
})
