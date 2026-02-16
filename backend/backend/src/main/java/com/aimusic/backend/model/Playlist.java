package com.aimusic.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "playlists")
public class Playlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String songName;
    
    @Column(nullable = false)
    private String songUrl;
    
    @Column(nullable = false)
    private String mood;
    
    // Constructors
    public Playlist() {}
    
    public Playlist(Long userId, String songName, String songUrl, String mood) {
        this.userId = userId;
        this.songName = songName;
        this.songUrl = songUrl;
        this.mood = mood;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getSongName() {
        return songName;
    }
    
    public void setSongName(String songName) {
        this.songName = songName;
    }
    
    public String getSongUrl() {
        return songUrl;
    }
    
    public void setSongUrl(String songUrl) {
        this.songUrl = songUrl;
    }
    
    public String getMood() {
        return mood;
    }
    
    public void setMood(String mood) {
        this.mood = mood;
    }
}