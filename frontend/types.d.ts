// YouTube API types
declare global {
	interface Window {
		YT: {
			Player: new (
				elementId: string,
				config: {
					playerVars: {
						autoplay: number
						controls: number
						mute: number
					}
					events: {
						onReady: (event: YT.PlayerEvent) => void
						onStateChange: (event: YT.OnStateChangeEvent) => void
					}
				},
			) => YT.Player
		}
	}
}

declare namespace YT {
	interface Player {
		id: number
		loadVideoById: (videoId: string, startSeconds: number) => void
		setPlaybackRate: (rate: number) => void
	}

	interface PlayerEvent {
		target: Player
	}

	interface OnStateChangeEvent {
		target: Player
		data: number
	}
}

export {}
