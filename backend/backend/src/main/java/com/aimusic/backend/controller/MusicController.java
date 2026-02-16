package com.aimusic.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.util.Random;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MusicController {

    @GetMapping("/play")
    public String playSong(@RequestParam String mood) {
        String folderPath = "D:/ai-music-project/frontend/public/songs/" + mood + "/";
        System.out.println("Looking for songs in: " + folderPath);
        File folder = new File(folderPath);
        
        System.out.println("Folder exists: " + folder.exists());
        System.out.println("Is directory: " + folder.isDirectory());

        if (folder.exists() && folder.isDirectory()) {
            File[] songs = folder.listFiles((dir, name) -> name.endsWith(".mp3"));
            
            System.out.println("Number of songs found: " + (songs != null ? songs.length : 0));

            if (songs != null && songs.length > 0) {
                Random random = new Random();
                File randomSong = songs[random.nextInt(songs.length)];
                return "http://localhost:3000/songs/" + mood + "/" + randomSong.getName();
            }
        }

        return "No songs found for mood: " + mood;
    }
    
    @GetMapping("/songs")
    public List<Map<String, String>> getAllSongs(@RequestParam String mood) {
        String folderPath = "D:/ai-music-project/frontend/public/songs/" + mood + "/";
        File folder = new File(folderPath);
        List<Map<String, String>> songs = new ArrayList<>();
        
        if (folder.exists() && folder.isDirectory()) {
            File[] songFiles = folder.listFiles((dir, name) -> name.endsWith(".mp3"));
            
            if (songFiles != null) {
                for (File song : songFiles) {
                    Map<String, String> songInfo = new HashMap<>();
                    songInfo.put("name", song.getName().replace(".mp3", ""));
                    songInfo.put("url", "http://localhost:3000/songs/" + mood + "/" + song.getName());
                    songInfo.put("mood", mood);
                    songs.add(songInfo);
                }
            }
        }
        
        return songs;
    }
}