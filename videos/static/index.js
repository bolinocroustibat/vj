var player1
var player2
var nextShownPlayer = player2

var failedYtTries = 0


// Loads the IFrame Player API code asynchronously.
var tag = document.createElement('script')
tag.src = "https://www.youtube.com/iframe_api"
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)


// Creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
	player1 = new YT.Player('player1', {
		playerVars: { 'autoplay': 1, 'controls': 0, 'mute': 1 },
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	}
	)

	player2 = new YT.Player('player2', {
		playerVars: { 'autoplay': 1, 'controls': 0, 'mute': 1 },
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	}
	)

}


// The YouTube API calls this function when the video player is ready.
function onPlayerReady(event) {
	console.log("Player " + event.target.id + " ready ")
	event.target.playVideo()
}


// The YouTube API calls this function when the player's state changes.
function onPlayerStateChange(event) {
	// console.log("Player " + event.target.id + " state changes to " + event.data)
	if (event.data == 1) {
		console.log("New video on player " + event.target.id + " is loaded, switching in 3s.")
		// Player has loaded video, let's wait a bit and show it
		setTimeout(function () {
			if (event.target.id == 1) {
				document.getElementById("player1").style.opacity = "1"
				document.getElementById("player2").style.opacity = "0";
			}
			else if (event.target.id == 2) {
				document.getElementById("player2").style.opacity = "1"
				document.getElementById("player1").style.opacity = "0";
			}
		}, 3000)
	}
}


function startVideo(player, youtubeId, playtime, length) {
	if (length) {
		const minStart = 5
		const maxStart = video.length - playtime - 5
		var start = Math.random() * (maxStart - minStart) + minStart // random number between minStart and maxStart
	} else {
		var start = Math.random() * (60 - 2) + 2 // random number between 2 and 60
	}
	player.loadVideoById(youtubeId, start)
	player.setPlaybackRate(0.25)
}


window.onload = () => {

	console.log("Will change every " + changePeriod + "sec...")
	setInterval(async () => {
		if (nextShownPlayer == player1) {
			console.log("Loading new video on player 1...")

			startVideo(player1, youtubeId, changePeriod, videoDuration)

			nextShownPlayer = player2
		}
		else {
			console.log("Loading new video on player 2....")

			startVideo(player2, youtubeId, changePeriod, videoDuration)

			nextShownPlayer = player1
		}
	}, changePeriod*1000);


}
