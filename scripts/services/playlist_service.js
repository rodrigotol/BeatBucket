(function() {
    'use strict';
    var app = angular.module('BeatBucket');

    const { app:mainApp } = require('electron').remote;
    var fs = require('fs');
    const path = require('path');
    
    app.service("playlistService", ['uuid', function(uuid) {
        var playlists = {};
        const DEFAULT_PLAYLIST = 'Default playlist'
        var playlistFolder = '';

        playlists[DEFAULT_PLAYLIST] = [];

        function newPlaylist(playlist_name) {
            if(playlist_name == null || playlist_name in playlists || playlist_name.trim() == '') return false;
            
            playlists[playlist_name] = [];            

            return true;
        }

        function renamePlaylist(old_playlist_name, new_playlist_name) {
            if(!(old_playlist_name in playlists) || old_playlist_name == DEFAULT_PLAYLIST || old_playlist_name == new_playlist_name) return false;

            if (new_playlist_name in playlists) {                
                return false;
            }

            playlists[new_playlist_name] = playlists[old_playlist_name];
            
            var old_playlist_path = getPlaylistPath(old_playlist_name);
            var new_playlist_path = getPlaylistPath(new_playlist_name);

            try {
                delete playlists[old_playlist_name];
                fs.renameSync(old_playlist_path, new_playlist_path);                
            }
            catch(e) { 
                alert('Failed to rename the file!'); 
            }

            return true;
        }

        function removePlaylist(playlist_name) {
            if(!(playlist_name in playlists) || playlist_name == DEFAULT_PLAYLIST) return false;
            
            delete playlists[playlist_name];
            var file_path = getPlaylistPath(playlist_name);

            if (fs.existsSync(file_path)) {
                fs.unlink(file_path, (err) => {
                    if (err) {
                        alert("Could not remove playlist");
                        console.log(err);                        
                    }
                });
            }

            return true;
        }

        function addSongToPlaylist(playlist_name, song) {
            if(playlist_name in playlists) {
                playlists[playlist_name].push(song);

                return true;
            }

            return false;
        }

        function removeSongFromPlaylist(playlist_name, song_index) {
            if((playlist_name in playlists) && playlists[playlist_name].length > song_index) {
                playlists[playlist_name].splice(song_index, 1);

                return true;
            }

            return false;
        }

        function getPlaylist(playlist_name) {
            if(playlist_name in playlists) {
                return playlists[playlist_name];
            }

            return null;            
        }

        function getPlaylistNames() {
            var names = [];
            
            angular.forEach(Object.keys(playlists), function(name){
                if (name !== DEFAULT_PLAYLIST) {
                    names.push(name);
                }
            });

            names.sort().unshift(DEFAULT_PLAYLIST);

            return names;
        }

        function getDefaultPlaylistName() {
            return DEFAULT_PLAYLIST;
        } 

        function savePlaylist(playlist_name) {            
            if(!(playlist_name in playlists) || playlist_name == DEFAULT_PLAYLIST) return;

            var file_path = getPlaylistPath(playlist_name);
            var song_paths = [];

            angular.forEach(playlists[playlist_name], function(song) {
                song_paths.push(song.path);
            });

            try { 
                fs.writeFileSync(file_path, JSON.stringify(song_paths)); 
            }
            catch(e) { 
                alert('Failed to save the file !'); 
            }
        }

        function loadPlaylist(playlist_name) {
            try { 
                var file_path = getPlaylistPath(playlist_name);

                if (!fs.existsSync(file_path)) return [];

                return JSON.parse(fs.readFileSync(file_path)); 
            }
            catch(e) { 
                alert('Failed to save the file !'); 
            }
        }

        function unloadPlaylist(playlist_name) {
            playlists[playlist_name] = [];
        }

        function loadPlaylistNames() {
            var list_names = [];
            var files = fs.readdirSync(playlistFolder);

            angular.forEach(files, function(file){
                var current_file = file.split('.config');

                if (current_file.length > 1) {
                    newPlaylist(current_file[0]);                        
                }                        
            });

            return list_names;
        }

        function copyPlaylist(sourcePlaylist, targetPlaylist) {
            newPlaylist(targetPlaylist);

            var existingPlaylist = [];

            if (sourcePlaylist == DEFAULT_PLAYLIST) {
                existingPlaylist = getPlaylist(sourcePlaylist);

                angular.forEach(existingPlaylist, function(song) {
                    addSongToPlaylist(targetPlaylist, song)
                });
            }else {
                existingPlaylist = loadPlaylist(sourcePlaylist);

                angular.forEach(existingPlaylist, function(song_path) {
                    addSongToPlaylist(targetPlaylist, new Song(uuid.v4(), song_path))
                });
            }            
            
            savePlaylist(targetPlaylist);
        }
        
        function createPlaylistFolder() {
            playlistFolder = path.join(mainApp.getPath('documents'), 'BeatBucket');

            if (!fs.existsSync(playlistFolder)) 
                fs.mkdirSync(playlistFolder);
        }

        function getPlaylistPath(playlist_name) {
            return path.join(playlistFolder, playlist_name + '.config');
        }

        createPlaylistFolder();

        return {
            newPlaylist: newPlaylist,
            renamePlaylist: renamePlaylist,
            removePlaylist: removePlaylist,
            addSongToPlaylist: addSongToPlaylist,
            removeSongFromPlaylist: removeSongFromPlaylist,
            getPlaylist: getPlaylist,
            getPlaylistNames: getPlaylistNames,
            getDefaultPlaylistName: getDefaultPlaylistName,
            savePlaylist: savePlaylist,
            loadPlaylist: loadPlaylist,
            unloadPlaylist: unloadPlaylist,
            loadPlaylistNames: loadPlaylistNames,
            copyPlaylist: copyPlaylist            
        }    
    }]);
})();