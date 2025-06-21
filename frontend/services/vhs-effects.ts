import type { Config } from "../types/config.js"
import { debugLog } from "../utils/helpers.js"

/**
 * Load VHS effects if enabled in config
 * Dynamically loads shader-doodle script and creates VHS shader elements
 */
export async function loadVHSEffects(config: Config): Promise<void> {
	debugLog(`VHS effect config value: ${config?.vhsEffect}`, config)

	// Clean up any existing VHS elements first
	const vhsContainer = document.getElementById("vhs-container")
	if (vhsContainer) {
		vhsContainer.innerHTML = ""
	}

	// Remove any existing shader-doodle scripts
	const existingScripts = document.querySelectorAll(
		'script[src*="shader-doodle"]',
	)
	for (const script of existingScripts) {
		script.remove()
	}

	if (!config?.vhsEffect) {
		debugLog("VHS effects disabled in config", config)
		return
	}

	try {
		// Load shader-doodle script
		const shaderScript = document.createElement("script")
		shaderScript.src = "/vhs/shader-doodle/shader-doodle.js"
		shaderScript.type = "module"
		document.head.appendChild(shaderScript)

		// Wait for script to load
		await new Promise((resolve, reject) => {
			shaderScript.onload = resolve
			shaderScript.onerror = reject
		})

		// Create VHS shader element
		if (vhsContainer) {
			vhsContainer.innerHTML = `
				<shader-doodle>
					<sd-texture src="/vhs/noise.png" name="noise"></sd-texture>
					<sd-texture src="/vhs/white.png" name="white"></sd-texture>
					<script src="/vhs/vhs.js" type="x-shader/x-fragment"></script>
				</shader-doodle>
			`
		}

		debugLog("VHS effects loaded successfully", config)
	} catch (error) {
		console.error("Failed to load VHS effects:", error)
	}
}
