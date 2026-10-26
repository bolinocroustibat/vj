import type { Config, OverlayEffect } from "../types/config.js"
import { debugLog } from "../utils/helpers.js"

const SHADER_DOODLE_SRC = "/vhs/shader-doodle/shader-doodle.js"

type OverlayShader = {
	src: string
	className: string
	textures: string
}

const VHS_TEXTURES = `
					<sd-texture src="/vhs/noise.png" name="noise"></sd-texture>
					<sd-texture src="/vhs/white.png" name="white"></sd-texture>`

const OVERLAY_SHADERS: Record<Exclude<OverlayEffect, "none">, OverlayShader> = {
	vhs: {
		src: "/vhs/vhs.js",
		className: "overlay-vhs",
		textures: VHS_TEXTURES,
	},
	grain: {
		src: "/effects/grain.js",
		className: "",
		textures: "",
	},
	crt: {
		src: "/effects/crt.js",
		className: "",
		textures: "",
	},
	scratches: {
		src: "/effects/scratches.js",
		className: "",
		textures: "",
	},
	leaks: {
		src: "/effects/leaks.js",
		className: "",
		textures: "",
	},
	glitch: {
		src: "/effects/glitch.js",
		className: "",
		textures: "",
	},
}

/**
 * Draw the chosen full-screen overlay.
 * VHS keeps the previous half-opaque canvas. The other shaders write their own alpha.
 */
export async function loadOverlayEffect(config: Config): Promise<void> {
	const effect = config.overlayEffect
	debugLog(`Overlay effect: ${effect}`, config)

	const container = document.getElementById("overlay-container")
	if (container) {
		container.innerHTML = ""
		container.classList.remove("overlay-vhs")
	}

	const existingScripts = document.querySelectorAll(
		'script[src*="shader-doodle"]',
	)
	for (const script of existingScripts) {
		script.remove()
	}

	if (effect === "none") {
		debugLog("Overlay effect disabled", config)
		return
	}

	const shader = OVERLAY_SHADERS[effect]

	try {
		const shaderScript = document.createElement("script")
		shaderScript.src = SHADER_DOODLE_SRC
		shaderScript.type = "module"
		document.head.appendChild(shaderScript)

		await new Promise((resolve, reject) => {
			shaderScript.onload = resolve
			shaderScript.onerror = reject
		})

		if (container) {
			if (shader.className) {
				container.classList.add(shader.className)
			}
			container.innerHTML = `
				<shader-doodle>
					${shader.textures}
					<script src="${shader.src}" type="x-shader/x-fragment"></script>
				</shader-doodle>
			`
		}

		debugLog(`Overlay effect "${effect}" loaded`, config)
	} catch (error) {
		console.error("Failed to load overlay effect:", error)
	}
}
