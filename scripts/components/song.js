const nodePath = require('path');

function Song(id, file_path) {
    var extension = nodePath.extname(file_path);

    this.id = id,
    this.title = nodePath.basename(file_path, extension),
    this.path = file_path,
    this.extension = extension
    this.song = null;
};

Song.prototype = {
    setup: function(onPlay, onPause, onStop, onEnd) {
        this.song = new Howl({
            src: [this.path],
            html5: true,
            onplay: onPlay,            
            onpause: onPause,
            onstop: onStop, 
            onend: onEnd
        });
    },
    tearDown: function(){
        if (this.song == null) return;
        
        this.song.stop();
        this.song.unload();
        this.song = null;
    }
};