(function() {
    'use strict';

    var app = angular.module('BeatBucket');
            
    app.service('timerService', ['$rootScope', function timerService($rootScope) {
        var timer = {
            song: null,
            interval_id: null
        }

        this.start = function(song) {                
            if (timer.interval_id !== null) return;
    
            timer.song = song;
    
            timer.interval_id = setInterval(function() {
                var song_duration = 0;
                var song_seek = 0;
    
                if (timer.interval_id) {
                    song_duration = Math.round(timer.song.duration());
                    song_seek = Math.round(timer.song.seek());
                }
    
                var data = getEmitPayload(formatTime(song_duration), 
                                               formatTime(song_seek), 
                                               calcSongProgress(song_duration, song_seek));
    
                $rootScope.$emit('timerTick', data);
            }, 50);
        }

        this.stop = function() {
            if (timer.interval_id) {
                clearInterval(timer.interval_id);
                timer.interval_id = null;
    
                var data = getEmitPayload(formatTime(0), 
                                          formatTime(0), 
                                          calcSongProgress(0, 0));
    
                $rootScope.$emit('timerTick', data);
            }        
        }

        this.getFormatedTime = function(secs) {
            return formatTime(secs);
        }

        this.getSongProgress = function(song_duration, song_seek) {
            return calcSongProgress(song_duration, song_seek);
        }

        function formatTime(secs) {
            var minutes = Math.floor(secs / 60);
            var seconds = (secs - minutes * 60);
    
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }

        function calcSongProgress(song_duration, song_seek) {
            return (((song_seek / song_duration) * 100) || 0) + '%';
        }

        function getEmitPayload(song_duration, song_seek, song_progress) {
            return {            
                 song_duration: song_duration,
                 song_seek: song_seek,
                 song_progress: song_progress
             };
        }
    }]);
})();