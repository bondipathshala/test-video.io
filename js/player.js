var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // host: 'https://www.youtube-nocookie.com',
        height: '390',
        width: '640',
        videoId: 'lzO2gzWhOJs?Version=3',
        BlockYoutubeButton: true,
        BlockCopyLink: 0,
        modestbranding: 0,
        showinfo: 0,
        rel:0,
        playerVars: {
            'playsinline': 1,
            rel: 0,
            enablejsapi: 1,
            controls:2,
            modestbranding: 0, ecver: 2, BlockCopyLink: 0,
        },

        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
        }
    });
    player.oncontextmenu = false;
    // document.oncontextmenu =function() {
    //     return false;
    // };

}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    distroyElement();
    event.target.playVideo();
}

var done = false;

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

function distroyElement() {
  var player = document.getElementById('player')
    console.log(cnt)
    player.style.disply = "none";
}
