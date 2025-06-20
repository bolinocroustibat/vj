import type { Config } from "../types/config.js"

/**
 * Load configuration with Docker-optimized API host
 * In Docker environments, the API host is always http://api:8000
 */
export async function loadConfig(): Promise<Config> {
	// Try to load base config from file
	let baseConfig: Config
	try {
		const response = await fetch("/config.json")
		baseConfig = await response.json()
	} catch (error) {
		console.error("Failed to load config.json:", error)
		throw new Error("Could not load configuration")
	}

	// Override apiHost for Docker environment
	// The API service is always available at http://api:8000 in Docker Compose
	baseConfig.apiHost = "http://api:8000"
	console.log(`Using Docker API host: ${baseConfig.apiHost}`)

	return baseConfig
}
