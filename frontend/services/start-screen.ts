import { OVERLAY_EFFECTS, type OverlayEffect } from "../types/config.js"

const EFFECT_LABELS: Record<OverlayEffect, string> = {
	vhs: "VHS",
	grain: "Film grain",
	crt: "CRT",
	scratches: "Scratches",
	leaks: "Light leaks",
	glitch: "Glitch",
	none: "None",
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const

export type StartChoices = {
	overlayEffect: OverlayEffect
	grayscale: boolean
	youtubePlaybackRate: number
}

const DEFAULT_CHOICES: StartChoices = {
	overlayEffect: "vhs",
	grayscale: true,
	youtubePlaybackRate: 0.25,
}

function fillSelect(
	select: HTMLSelectElement,
	options: { value: string; label: string; selected: boolean }[],
): void {
	select.innerHTML = ""
	for (const option of options) {
		const el = document.createElement("option")
		el.value = option.value
		el.textContent = option.label
		el.selected = option.selected
		select.appendChild(el)
	}
}

/**
 * Show the start screen and resolve with the visual choices the user picked.
 */
export function waitForStart(): Promise<StartChoices> {
	const screen = document.getElementById("start-screen")
	const effectSelect = document.getElementById(
		"overlay-effect-select",
	) as HTMLSelectElement | null
	const grayscaleSelect = document.getElementById(
		"grayscale-select",
	) as HTMLSelectElement | null
	const rateSelect = document.getElementById(
		"playback-rate-select",
	) as HTMLSelectElement | null
	const button = document.getElementById(
		"start-button",
	) as HTMLButtonElement | null

	if (!screen || !effectSelect || !grayscaleSelect || !rateSelect || !button) {
		return Promise.resolve(DEFAULT_CHOICES)
	}

	fillSelect(
		effectSelect,
		OVERLAY_EFFECTS.map((effect) => ({
			value: effect,
			label: EFFECT_LABELS[effect],
			selected: effect === DEFAULT_CHOICES.overlayEffect,
		})),
	)

	fillSelect(grayscaleSelect, [
		{
			value: "true",
			label: "On",
			selected: DEFAULT_CHOICES.grayscale,
		},
		{
			value: "false",
			label: "Off",
			selected: !DEFAULT_CHOICES.grayscale,
		},
	])

	fillSelect(
		rateSelect,
		PLAYBACK_RATES.map((rate) => ({
			value: String(rate),
			label: `${rate}×`,
			selected: rate === DEFAULT_CHOICES.youtubePlaybackRate,
		})),
	)

	screen.hidden = false

	return new Promise((resolve) => {
		button.addEventListener(
			"click",
			() => {
				const overlayEffect = (OVERLAY_EFFECTS as readonly string[]).includes(
					effectSelect.value,
				)
					? (effectSelect.value as OverlayEffect)
					: DEFAULT_CHOICES.overlayEffect

				const parsedRate = Number(rateSelect.value)
				const youtubePlaybackRate = PLAYBACK_RATES.includes(
					parsedRate as (typeof PLAYBACK_RATES)[number],
				)
					? parsedRate
					: DEFAULT_CHOICES.youtubePlaybackRate

				screen.hidden = true
				resolve({
					overlayEffect,
					grayscale: grayscaleSelect.value === "true",
					youtubePlaybackRate,
				})
			},
			{ once: true },
		)
	})
}
