(function(){
    'use strict';    
    const { dialog, getCurrentWindow } = require('electron').remote;
    const { ipcRenderer } = require('electron');

    angular.module('BeatBucket')
        .controller('BeatBucketController', BeatBucketController);

    BeatBucketController.$inject = ['$rootScope', '$scope', 'uuid', 'playlistService', 'timerService'];
    function BeatBucketController($rootScope, $scope, uuid, playlistService, timerService) {
        var vm = this;
        var player_window = getCurrentWindow();
        var timer = timerService;

        // arrow seek interval in seconds
        const arrowSeekInterval = 10;
        
        vm.playlistService = playlistService;

        vm.defaultPlaylistName = vm.playlistService.getDefaultPlaylistName();
        vm.currentPlaylistName = vm.playlistService.getDefaultPlaylistName();
        vm.currentPlaylist = vm.playlistService.getPlaylist(vm.currentPlaylistName);   
        vm.viewPlaylistSongs = vm.currentPlaylist;     
        vm.viewPlaylistName = vm.currentPlaylistName;         
        vm.playOrder = [];
        vm.playedSongs = new Set();

        vm.songDuration = timer.getFormatedTime(0);
        vm.songPosition = timer.getFormatedTime(0);
        vm.progressBar = timer.getSongProgress(1, 0);

        vm.currentSong = null;                        
        vm.currentSongIndex = -1;
        vm.showPlayButton = true;        
        vm.shuffleMode = false;
        vm.contextMenuTarget = null;
        vm.newPlaylist = false;
        vm.renamingPlaylistName = null;
        vm.isRenamingPlaylist = false;
        vm.isCopyingPlaylist = false;
        vm.currentTheme = 'theme-dark';

        vm.openDialog = function() {
            dialog.showOpenDialog(null, 
            {
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'MP3', extensions: ['mp3'] }
                ]
            })
            .then(function(result) {
                if (result.canceled || result.filePaths.length == 0)
                    return;
            
                var listCount = vm.currentPlaylist.length;
                loadSongs(result.filePaths, true);

                if(vm.currentSong == null)
                    play();                    
                
                if (vm.shuffleMode && vm.viewPlaylistName == vm.currentPlaylistName)
                    shuffleSongs(listCount);
            });                        
        }

        vm.toggleShuffle = function () {
            vm.shuffleMode = !vm.shuffleMode;

            if(!vm.shuffleMode && vm.playOrder)
                vm.currentSongIndex = vm.playOrder[vm.currentSongIndex];

            vm.playOrder = [];            

            if (vm.shuffleMode)
                shuffleSongs(0, vm.currentSong != null);
            else {
                vm.playedSongs = new Set();
                if (vm.currentSong)
                    vm.playedSongs.add(vm.currentSongIndex);
            }                
        }        

        vm.skip = function (position, direction='next'){
            if (timer)
                timer.stop();
            
            if (position !== null) {
                vm.currentSongIndex = -1;
                vm.currentPlaylist = vm.playlistService.getPlaylist(vm.viewPlaylistName);
                vm.currentPlaylistName = vm.viewPlaylistName;
            }

            if (vm.currentPlaylist.length == 0){
                if (vm.currentSong) {                    
                    vm.currentSong.tearDown();
                    vm.currentSong = null;
                }

                vm.play_pause();

                return;
            }

            if (position != null) {
                if(!vm.shuffleMode)
                    vm.currentSongIndex = position;
                else if (vm.playOrder){                   
                    for(var i = 0; i < vm.playOrder.length; i++) {
                        if (vm.playOrder[i] == position){
                            vm.currentSongIndex = i;
                            break;
                        }                            
                    }                                        
                }                
            } else {
                if (direction == 'next') {
                    if (vm.currentPlaylist.length > vm.currentSongIndex + 1) {
                        vm.currentSongIndex++;
                    } else {
                        vm.currentSongIndex=0;
                    }
                } else {
                    if (vm.currentSongIndex > 0) {
                        vm.currentSongIndex--;
                    } else {
                        vm.currentSongIndex = vm.currentPlaylist.length - 1;
                    }
                }                
            }            

            play();
        }

        vm.play_pause = function() {
            if(!vm.currentSong) {
                if (vm.currentPlaylist.length == 0) {
                    vm.showPlayButton = true;
                    return;
                } else {
                    vm.currentSongIndex == -1;
                    vm.skip(null);
                }             
            }

            if (vm.currentSong.song.playing()) {
                vm.currentSong.song.pause();
                vm.showPlayButton = true;
            } else {
                vm.currentSong.song.play();
                vm.showPlayButton = false;
            }                
        }

        vm.seek = function(event) {
            if (vm.currentSong) {
                var container = document.getElementsByClassName('player-container')[0];
                var container_style = window.getComputedStyle(container);
                var margin_left = container_style.marginLeft.split('px')[0];
                var mouse_position = event.clientX - margin_left;
                var position = mouse_position > container.getBoundingClientRect().width ? container.getBoundingClientRect().width : mouse_position;   

                vm.currentSong.song.seek(vm.currentSong.song.duration() * (position / container.getBoundingClientRect().width));
            }                
        }

        vm.seekArrowLeft = function () {
            if (!vm.currentSong) return;

            var target = vm.currentSong.song.seek() - arrowSeekInterval;

            target = target > 0 ? target: 0;

            vm.currentSong.song.seek(target);
        }

        vm.seekArrowRight = function () {
            if (!vm.currentSong) return;

            var target = vm.currentSong.song.seek() + arrowSeekInterval;

            target = target < vm.currentSong.song.duration() ? target: vm.currentSong.song.duration() - 1;

            vm.currentSong.song.seek(target);
        }

        vm.removeSong = function() {            
            if (vm.contextMenuTarget == null) return;
            
            dialog.showMessageBox

            var indexToUpdate = vm.contextMenuTarget;

            if (vm.viewPlaylistName != vm.currentPlaylistName && vm.contextMenuTarget < vm.viewPlaylistSongs.length) {
                vm.viewPlaylistSongs.splice(indexToUpdate, 1);

                return;
            }

            if (vm.contextMenuTarget >= vm.currentPlaylist.length) return;
            var currentSong = vm.playOrder.length > 0 ? vm.playOrder[vm.currentSongIndex] : vm.currentSongIndex;
            
            for (var i =0; i < vm.playOrder.length; i++) {
                if (vm.playOrder[i] == vm.contextMenuTarget) {
                    indexToUpdate = i;                    
                }else if (vm.playOrder[i] > vm.contextMenuTarget){
                    vm.playOrder[i]--;
                }
            }

            if (vm.playOrder.length > 0) {
                vm.playOrder.splice(indexToUpdate, 1);

                if (indexToUpdate < vm.currentSongIndex)
                    vm.currentSongIndex--;
            }else if (vm.contextMenuTarget < vm.currentSongIndex) {
                vm.currentSongIndex--;            
            }    
            
            vm.currentPlaylist.splice(vm.contextMenuTarget, 1);

            if (vm.playedSongs.has(vm.contextMenuTarget)) {
                vm.playedSongs.delete(vm.contextMenuTarget);
                var remaingPlayed =  Array.from(vm.playedSongs.keys());

                for(var key of remaingPlayed) {
                    if (key > vm.contextMenuTarget) {
                        vm.playedSongs.delete(key);
                        vm.playedSongs.add(key - 1);
                    }
                }                
            }            
         
            if (vm.contextMenuTarget == currentSong) {
                vm.currentSongIndex--;
                vm.skip(null);
            }
        }

        vm.closeApp = function() {            
            player_window.close();
        }

        vm.minimizeApp = function() {
            player_window.minimize();
        }

        vm.showNewPlaylist = function() {
            vm.newPlaylist = true;

            applyScope();
        }

        vm.hideNewPlaylist = function() {
            vm.newPlaylist = false;

            applyScope();
        }

        vm.createNewPlaylist = function(playlist_name=null) {
            if (playlist_name == null) return;

            vm.playlistService.newPlaylist(playlist_name);
            vm.hideNewPlaylist();
        }

        vm.showRenamePlaylist = function() {
            if (vm.contextMenuTarget == null) return;

            vm.renamingPlaylistName = vm.contextMenuTarget;
            vm.isRenamingPlaylist = true;            
        }

        vm.hideRenamePlaylist = function() {
            vm.isRenamingPlaylist = false;

            applyScope();
        }

        vm.showCopyPlaylist = function() {
            if (vm.contextMenuTarget == null) return;

            vm.copyingPlaylist = vm.contextMenuTarget;
            vm.isCopyingPlaylist = true;            
        }

        vm.copyPlaylist = function(playlist_name=null) {
            if (playlist_name == null) return;
            
            vm.playlistService.copyPlaylist(vm.copyingPlaylist, playlist_name);
            
            vm.playlistService.savePlaylist(playlist_name);
            vm.hideCopyPlaylist();
        }

        vm.hideCopyPlaylist = function() {
            vm.isCopyingPlaylist = false;

            applyScope();
        }

        vm.renamePlaylist = function (playlist_name=null) {
            if (playlist_name == null) return;
            
            var success = vm.playlistService.renamePlaylist(vm.renamingPlaylistName, playlist_name)

            if (success) {
                if (vm.currentPlaylistName == vm.renamingPlaylistName) {
                    vm.currentPlaylistName = playlist_name;
                }
    
                if (vm.viewPlaylistName == vm.renamingPlaylistName) {
                    vm.viewPlaylistName = playlist_name;
                }
            }            

            vm.hideRenamePlaylist();
        }

        vm.removePlaylist = function() {
            if (vm.contextMenuTarget == null) return;

            const options = {
                type: 'question',
                buttons: ['Yes', 'No'],
                defaultId: 1,
                title: 'Remove playlist',
                message: 'Do you really want to remove this playlist?'
            };
            
            dialog.showMessageBox(null, options).then((data) => {
                if(data.response == 0)
                    confirmRemovePlaylist();
            });
        }

        vm.setViewPlaylist = function(name, unload_previous=true) {
            var playlist = vm.playlistService.getPlaylist(name);
            var previousPlaylist = vm.viewPlaylistName;

            if (playlist !== null) {                
                vm.viewPlaylistSongs = playlist;
                vm.viewPlaylistName = name;
                // TODO: could be more elegant
                document.getElementById('songlist').scrollTo(0, 0);

                if (playlist.length == 0){
                    loadSongs(vm.playlistService.loadPlaylist(name));
                }

                if(!vm.currentSong) {
                    vm.currentPlaylist = vm.viewPlaylistSongs;
                    vm.currentPlaylistName = vm.viewPlaylistName;
                }

                if (unload_previous && previousPlaylist != vm.defaultPlaylistName && previousPlaylist != vm.currentPlaylistName) {
                    // Free some memory
                    vm.playlistService.unloadPlaylist(previousPlaylist);
                }
            }
        }

        vm.setCurrentPlaylist = function(name) {            
            vm.setViewPlaylist(name, false);
            var playlist = vm.playlistService.getPlaylist(name);            

            if (playlist !== null) {
                vm.playedSongs = new Set();
                vm.currentPlaylist = playlist;
                vm.currentPlaylistName = name;
                vm.currentSongIndex = -1;

                if (vm.shuffleMode) {
                    vm.playOrder = [];
                    shuffleSongs(0);
                }                

                vm.skip(null);
            }


        }

        vm.toggleTheme = function() {
            //TODO: needs improvement
            if (vm.currentTheme == "theme-dark")
                vm.currentTheme = "theme-light";
            else
                vm.currentTheme = "theme-dark";
        }

        vm.getDisplayPlayListSize = function() {
            if (vm.viewPlaylistSongs.length == 0)
                return "";
            
            return '(' + String(vm.viewPlaylistSongs.length) + ')';
        }

        vm.hideOnRename = function(playlist_name) {
            return vm.isRenamingPlaylist && vm.renamingPlaylistName == playlist_name;
        }

        vm.getPlaylistContextMenu = function(playlist_name) {
            if(playlist_name != vm.defaultPlaylistName)
                return "playlistContext";
            
            return "defaultPlaylistContext";
        }

        function confirmRemovePlaylist() {
            if (vm.viewPlaylistName == vm.contextMenuTarget) {
                vm.setViewPlaylist(vm.playlistService.getDefaultPlaylistName());
            }

            if (vm.currentPlaylistName == vm.contextMenuTarget) {
                vm.setCurrentPlaylist(vm.playlistService.getDefaultPlaylistName());                
            }

            vm.playlistService.removePlaylist(vm.contextMenuTarget);
            applyScope();
        }

        function shuffleSongs (startPosition, keepPlayedLast=false) {
            var currentSongPosition = null;            
            var newIndexes = [];            
            var lastIndexes = {};

            for (var i = vm.currentPlaylist.length - 1; i >= startPosition; i--) {
                if (keepPlayedLast && vm.playedSongs.has(i)) {
                    var lastIndex = vm.currentSongIndex - Object.keys(lastIndexes).length;

                    if (lastIndex < 0) {
                        lastIndex = vm.currentPlaylist.length - lastIndex;
                    }
                    lastIndexes[lastIndex] = i;
                }else{
                    newIndexes.push(i);
                }
            }            
                        
            currentSongPosition = randomizeSongs(newIndexes, lastIndexes);                    
            
            if (currentSongPosition !== null) {
                var target = vm.playOrder[vm.currentSongIndex];
                vm.playOrder[vm.currentSongIndex] = vm.currentSongIndex;
                vm.playOrder[currentSongPosition] = target;                
            }
            
        }

        function randomizeSongs(newIndexes, lastIndexes) {
            var currentSongPosition = null;  

            while(newIndexes.length > 0) {
                var random_position = Math.floor(Math.random() * newIndexes.length);

                if (vm.currentSong != null && vm.currentPlaylist[newIndexes[random_position]].id == vm.currentSong.id)
                    currentSongPosition = vm.playOrder.length;
                
                if (vm.playOrder.length in lastIndexes){                    
                    vm.playOrder.push(lastIndexes[vm.playOrder.length]);
                    delete lastIndexes[vm.playOrder.length - 1];
                }else {
                    vm.playOrder.push(newIndexes[random_position]);
                    newIndexes.splice(random_position, 1);
                }                              
            }
            
            angular.forEach(Object.keys(lastIndexes), function(key){
                vm.playOrder.push(lastIndexes[key]);
            });

            lastIndexes = {};

            return currentSongPosition;
        }

        function play() {
            if (vm.currentPlaylist.length == 0){
                return;
            }

            if (!vm.currentSong && vm.currentSongIndex == -1) {
                vm.currentSongIndex = 0;
            } else if (vm.currentSong) {                                
                vm.currentSong.tearDown();
            }            
            
            vm.progressBar = '0%';
            vm.progressBarComp = '100%';

            var targetIndex = vm.currentSongIndex;
            
            if (vm.shuffleMode && vm.playOrder.length > 0) {                
                targetIndex = vm.playOrder[vm.currentSongIndex];
            } else {
                vm.playedSongs.add(targetIndex);
            }

            vm.currentSong = setupSong(vm.currentPlaylist[targetIndex]);
            vm.currentSong.song.play();
        }

        function songOnPlay() {            
            timer.start(vm.currentSong.song);
            vm.showPlayButton = false;
        }

        function songOnPauseStop() {
            vm.showPlayButton = true;
        }

        function songOnEnd() {
            timer.stop();
            vm.skip(null);
        }

        function setupSong(song) { 
            song.setup(songOnPlay, songOnPauseStop, songOnPauseStop, songOnEnd);            

            return song                  
        }

        function loadSongs(filePaths, save_playlist=false) {                        
            for (var i in filePaths) {
                var fpath = filePaths[i];
                var isNewSong = true;
                for (var index in vm.viewPlaylistName) {
                    if (fpath == vm.viewPlaylistName[index].path)
                        isNewSong = false;
                }

                if (isNewSong) {
                    vm.playlistService.addSongToPlaylist(vm.viewPlaylistName, new Song(uuid.v4(), fpath))
                }
            }
            
            if (save_playlist)
                vm.playlistService.savePlaylist(vm.viewPlaylistName);
        }

        function loadPlaylist(playlist_name) {
            var songs = vm.playlistService.loadPlaylist(playlist_name);

            if (songs.length > 0) {
                loadSongs(songs);
            }
        }

        function loadSongsFromArgs(args) {
            var songs = [];

            if (args.length >= 2) {                
                for (var index = 1; index < args.length; index++) {
                    if (args[index].endsWith('.mp3')){
                        songs.push(args[index]);
                    }                    
                }
                
                if (songs.length > 0) {
                    loadSongs(songs);
                
                    if(!vm.currentSong)
                        play();
                }                
            }
        }

        function applyScope() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }

        function init() {
            vm.playlistService.loadPlaylistNames();
            loadPlaylist(vm.currentPlaylistName);

            applyScope();
        }

        $rootScope.$on('timerTick', function(event, data) {
            if(!vm.currentSong || timer == null) return;
            
            var songPosition = data.song_seek;

            if (!isNaN(songPosition.replace(":", "")))            
                vm.songPosition = songPosition;

            vm.songDuration =  data.song_duration;
            vm.progressBar = data.song_progress;

            if(!$scope.$$phase) {
                $scope.$apply();
              }
        });

        ipcRenderer.on('new-song-added', (event, arg) => {
            loadSongsFromArgs(arg);       
        });
        
        init();        
    }
})();