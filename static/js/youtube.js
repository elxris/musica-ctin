var socket = io('http://localhost');
socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'coolKids',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
	console.log("ready", event)
}

function onPlayerStateChange(event) {
	console.log("state", event)
	if (event.data == -1) {
		
	}
}
