package com.aimusic.backend.controller;

import com.aimusic.backend.model.Playlist;
import com.aimusic.backend.repository.PlaylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/playlist")
public class PlaylistController {
    
    @Autowired
    private PlaylistRepository playlistRepository;
    
    @PostMapping("/add")
    public ResponseEntity<?> addToPlaylist(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String songName = request.get("songName").toString();
            String songUrl = request.get("songUrl").toString();
            String mood = request.get("mood").toString();
            
            Playlist playlist = new Playlist(userId, songName, songUrl, mood);
            playlistRepository.save(playlist);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Added to playlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/get")
    public List<Playlist> getPlaylist(@RequestParam Long userId) {
        return playlistRepository.findByUserId(userId);
    }
    
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFromPlaylist(@PathVariable Long id) {
        try {
            playlistRepository.deleteById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Removed from playlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}