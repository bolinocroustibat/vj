import type { Config } from "../types/config.js"

export function logConfig(config: Config): void {
	console.log(`Change period: ${config.changePeriod}`)
	console.log(`Themes: ${config.youtubeThemes.map(String)}`)
	console.log(`API host: ${config.apiHost}`)
}

export function createMicrophoneButton(): HTMLButtonElement {
	const button = document.createElement("button")
	button.textContent = "🎤 Enable Beat Detection"
	button.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		padding: 10px 20px;
		background: #333;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
	`

	return button
}

// Debug logging utility
export function debugLog(
	message: string,
	config: Config | null,
	...args: unknown[]
): void {
	if (config?.debug) {
		console.log(message, ...args)
	}
}
