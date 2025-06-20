// Configuration interfaces
export interface Config {
	newVideoRequestDelay: number
	videoSwitchDelay: number
	youtubeThemes: (string | null)[]
	apiHost: string
	debug?: boolean
	// Beat detection configuration
	beatDetection?: {
		/**
		 * Minimum total audio energy required to consider a beat
		 * Low values (100-300): Very sensitive, triggers on quiet sounds
		 * High values (800-1200): Very selective, only loud sounds
		 * Typical range: 300-800
		 */
		energyThreshold: number

		/**
		 * Minimum bass frequency energy required to consider a beat
		 * Low values (100-200): Triggers on any bass sound
		 * High values (600-1000): Only strong bass kicks/drums
		 * Typical range: 200-600
		 * Increase this to make detector more bass-focused
		 */
		bassThreshold: number

		/**
		 * Minimum time between detected beats (milliseconds)
		 * Low values (100-200): Fast response, may detect rapid beats
		 * High values (500-1000): Slower response, prevents false positives
		 * Typical range: 200-500
		 * For reference:
		 * 120 BPM = 500ms between beats
		 * 130 BPM = 462ms between beats
		 * 140 BPM = 429ms between beats
		 * 150 BPM = 400ms between beats
		 */
		beatCooldown: number

		/**
		 * Minimum confidence level to trigger a beat (0.0 to 1.0)
		 * Low values (0.1-0.2): Very permissive, many weak beats
		 * High values (0.6-0.8): Very selective, only strong beats
		 * Typical range: 0.2-0.5
		 * Filters out uncertain detections
		 */
		confidenceThreshold: number
	}
	/**
	 * Enable VHS visual effects overlay
	 * When true, applies retro VHS-style visual effects to the video
	 * When false, videos play without any visual effects
	 */
	vhsEffect?: boolean
	/**
	 * Enable grayscale filter on videos
	 * When true, videos are displayed in black and white
	 * When false, videos are displayed in full color
	 */
	grayscaleFilter?: boolean
}

export interface Video {
	youtubeId: string
	videoDuration?: number
}
