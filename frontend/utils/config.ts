import type { Config } from "../types/config.js"

/**
 * Load configuration from Vite environment variables
 * Environment variables are injected by Docker Compose
 */
export async function loadConfig(): Promise<Config> {
	// Parse YouTube themes from comma-separated string
	const youtubeThemesStr =
		import.meta.env.VITE_YOUTUBE_THEMES || "saucisson,showa era"
	const youtubeThemes = youtubeThemesStr.split(",").map((theme) => theme.trim())

	// Parse beat detection config
	const beatDetection = {
		energyThreshold:
			Number(import.meta.env.VITE_BEAT_DETECTION_ENERGY_THRESHOLD) || 1000,
		bassThreshold:
			Number(import.meta.env.VITE_BEAT_DETECTION_BASS_THRESHOLD) || 300,
		beatCooldown:
			Number(import.meta.env.VITE_BEAT_DETECTION_BEAT_COOLDOWN) || 300,
		confidenceThreshold:
			Number(import.meta.env.VITE_BEAT_DETECTION_CONFIDENCE_THRESHOLD) || 0.99,
	}

	const config: Config = {
		newVideoRequestDelay:
			Number(import.meta.env.VITE_NEW_VIDEO_REQUEST_DELAY) || 8,
		videoSwitchDelay: Number(import.meta.env.VITE_VIDEO_SWITCH_DELAY) || 2,
		youtubeThemes,
		apiHost: "http://api:8000", // Always use Docker internal network
		debug: import.meta.env.VITE_DEBUG === "true",
		vhsEffect: import.meta.env.VITE_VHS_EFFECT === "true",
		beatDetection,
	}

	console.log("Loaded config from environment variables:", config)
	return config
}
