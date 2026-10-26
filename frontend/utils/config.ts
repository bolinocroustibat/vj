import {
	OVERLAY_EFFECTS,
	type Config,
	type OverlayEffect,
} from "../types/config.js"

function isOverlayEffect(value: string): value is OverlayEffect {
	return (OVERLAY_EFFECTS as readonly string[]).includes(value)
}

/**
 * Empty or missing values keep the current VHS look.
 * Anything else that is not a known name draws nothing.
 */
function parseOverlayEffect(value: string | undefined): OverlayEffect {
	const effect = (value ?? "").trim().toLowerCase()
	if (effect === "") {
		return "vhs"
	}
	if (isOverlayEffect(effect)) {
		return effect
	}
	console.warn(
		`Unknown overlay effect "${value}". Expected one of: ${OVERLAY_EFFECTS.join(", ")}. Drawing nothing.`,
	)
	return "none"
}

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
		overlayEffect: parseOverlayEffect(import.meta.env.VITE_OVERLAY_EFFECT),
		grayscale: import.meta.env.VITE_GRAYSCALE === "true",
		youtubePlaybackRate: Number(import.meta.env.VITE_YOUTUBE_PLAYBACK_RATE),
		beatDetection,
	}

	console.log("Loaded config from environment variables:", config)
	return config
}
