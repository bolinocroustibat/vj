import type { Config } from "../types/config.js"

/**
 * Load configuration from Vite environment variables
 * Environment variables are injected by Docker Compose during build
 */
export async function loadConfig(): Promise<Config> {
	// Parse YouTube themes from comma-separated string
	const youtubeThemesStr = import.meta.env.VITE_YOUTUBE_THEMES || ""
	const youtubeThemes = youtubeThemesStr
		.split(",")
		.map((theme) => theme.trim())
		.filter((theme) => theme.length > 0)

	// Parse beat detection config
	const beatDetection = {
		energyThreshold: Number(import.meta.env.VITE_BEAT_DETECTION_ENERGY_THRESHOLD),
		bassThreshold: Number(import.meta.env.VITE_BEAT_DETECTION_BASS_THRESHOLD),
		beatCooldown: Number(import.meta.env.VITE_BEAT_DETECTION_BEAT_COOLDOWN),
		confidenceThreshold: Number(import.meta.env.VITE_BEAT_DETECTION_CONFIDENCE_THRESHOLD),
	}

	const config: Config = {
		newVideoRequestDelay: Number(import.meta.env.VITE_NEW_VIDEO_REQUEST_DELAY),
		videoSwitchDelay: Number(import.meta.env.VITE_VIDEO_SWITCH_DELAY),
		youtubeThemes,
		apiHost: "http://api:8000", // Always use Docker internal network
		debug: import.meta.env.VITE_DEBUG === "true",
		vhsEffect: import.meta.env.VITE_VHS_EFFECT === "true",
		grayscale: import.meta.env.VITE_GRAYSCALE === "true",
		youtubePlaybackRate: Number(import.meta.env.VITE_YOUTUBE_PLAYBACK_RATE),
		beatDetection,
	}

	console.log("Loaded config from environment variables:", config)
	return config
}
