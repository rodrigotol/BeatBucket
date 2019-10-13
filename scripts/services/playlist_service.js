(function (){
    'use strict';
    var app = angular.module('BeatBucket');

    const electron = require('electron');
    var fs = require('fs');
    const path = require('path');    

    app.service("playlistService", function() {        
        var playlists = {};
        const DEFAULT_PLAYLIST = 'Default playlist'
        var playlistFolder = '';

        playlists[DEFAULT_PLAYLIST] = [];

        this.newPlaylist = function(playlist_name) {
            createNewPlaylist(playlist_name)
        }

        this.removePlaylist = function(playlist_name) {
            if(!(playlist_name in playlists) || playlist_name == DEFAULT_PLAYLIST) return false;
            
            delete playlists[playlist_name];

            return true;
        }

        this.addSongToPlaylist = function(playlist_name, song) {
            if(playlist_name in playlists) {
                playlists[playlist_name].push(song);

                return true;
            }

            return false;
        }

        this.removeSongFromPlaylist = function(playlist_name, song_index) {
            if((playlist_name in playlists) && playlists[playlist_name].length > song_index) {
                playlists[playlist_name].splice(song_index, 1);

                return true;
            }

            return false;
        }

        this.getPlaylist = function(playlist_name) {
            if(playlist_name in playlists) {
                return playlists[playlist_name];
            }

            return null;            
        }

        this.getPlaylistNames = function() {
            var names = [];
            
            angular.forEach(Object.keys(playlists), function(name){
                names.push(name);
            });

            return names;
        }

        this.getDefaultPlaylistName = function() {
            return DEFAULT_PLAYLIST;
        } 

        this.savePlaylist = function(playlist_name) {            
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

        this.loadPlaylist = function(playlist_name) {
            try { 
                var file_path = getPlaylistPath(playlist_name);

                if (!fs.existsSync(file_path)) return [];

                return JSON.parse(fs.readFileSync(file_path)); 
            }
            catch(e) { 
                alert('Failed to save the file !'); 
            }
        }

        this.loadPlaylistNames = function() {             
            var list_names = [];
            var files = fs.readdirSync(playlistFolder);

            angular.forEach(files, function(file){
                var current_file = file.split('.json');

                if (current_file.length > 1) {
                    createNewPlaylist(current_file[0]);                        
                }                        
            });

            return list_names;
        }
        
        function createPlaylistFolder() {
            playlistFolder = path.join(electron.remote.app.getPath('documents'), 'BeatBucket');

            if (!fs.existsSync(playlistFolder)) 
                fs.mkdirSync(playlistFolder);
        }

        function getPlaylistPath(playlist_name) {
            return path.join(playlistFolder, playlist_name + '.json');
        }

        function createNewPlaylist(playlist_name) {
            if(playlist_name == null || playlist_name in playlists || playlist_name.trim() == '') return false;
            
            playlists[playlist_name] = [];            

            return true;
        }

        createPlaylistFolder();
    });
})();