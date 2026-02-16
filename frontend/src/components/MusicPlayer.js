import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';  // ADDED useLocation
import VoiceControl from './VoiceControl';
import FaceDetection from './FaceDetection';
import Visualizer from './Visualizer';
import { formatTime, getMoodEmoji, getTimeGreeting } from '../utils/helpers';

function MusicPlayer({ username, userId, onLogout, theme, currentTheme, setTheme, themes, favorites, addToFavorites, removeFromFavorites, addToHistory }) {
  const navigate = useNavigate();
  const location = useLocation();  // ADDED THIS LINE
  const audioRef = useRef(null);
  
  const [allSongs, setAllSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentMood, setCurrentMood] = useState("love");
  const [playlist, setPlaylist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    fetchSongs(currentMood);
  }, [currentMood]);

  useEffect(() => {
    if (userId) {
      loadPlaylistFromDB();
    }
  }, [userId]);

  // ADDED: Play song passed from Favorites page
  useEffect(() => {
    if (location.state?.songToPlay) {
      const songToPlay = location.state.songToPlay;
      setCurrentSong(songToPlay);
      setIsPlaying(true);
      addToHistory(songToPlay);
      
      // Clear the state so it doesn't replay on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => playNextInQueue();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue]);

  const fetchSongs = async (mood) => {
    try {
      const response = await fetch(`http://localhost:8081/songs?mood=${mood}`);
      const songs = await response.json();
      setAllSongs(songs);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

  const loadPlaylistFromDB = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/playlist/get?userId=${userId}`);
      const dbPlaylist = await response.json();
      const formattedPlaylist = dbPlaylist.map(item => ({
        id: item.id,
        name: item.songName,
        url: item.songUrl,
        mood: item.mood
      }));
      setPlaylist(formattedPlaylist);
    } catch (err) {
      console.error("Error loading playlist:", err);
    }
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    addToHistory(song);
  };

  const addToPlaylistDB = async (song) => {
    if (!playlist.find(s => s.url === song.url)) {
      try {
        const response = await fetch('http://localhost:8081/api/playlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            songName: song.name,
            songUrl: song.url,
            mood: song.mood
          })
        });
        
        const data = await response.json();
        if (data.success) {
          loadPlaylistFromDB();
        }
      } catch (err) {
        console.error("Error adding to playlist:", err);
      }
    }
  };

  const removeFromPlaylistDB = async (song) => {
    try {
      const response = await fetch(`http://localhost:8081/api/playlist/remove/${song.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setPlaylist(playlist.filter(s => s.id !== song.id));
      }
    } catch (err) {
      console.error("Error removing from playlist:", err);
    }
  };

  const playRandom = () => {
    if (allSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      playSong(allSongs[randomIndex]);
    }
  };

  const playNextInQueue = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(queue.slice(1));
      playSong(nextSong);
    } else {
      playRandom();
    }
  };

  const addToQueue = (song) => {
    setQueue([...queue, song]);
  };

  const handleVoiceCommand = (command) => {
    if (command.type === 'changeMood') {
      setCurrentMood(command.mood);
      setTimeout(() => playRandom(), 500);
    } else if (command.type === 'shuffle' || command.type === 'next') {
      playRandom();
    } else if (command.type === 'pause') {
      audioRef.current?.pause();
    } else if (command.type === 'resume') {
      audioRef.current?.play();
    } else if (command.type === 'addToPlaylist' && currentSong) {
      addToPlaylistDB(currentSong);
    } else if (command.type === 'showHistory') {
      navigate('/statistics');
    } else if (command.type === 'showPlaylist') {
      navigate('/favorites');
    }
  };

  const handleFaceMoodDetected = (mood) => {
    setCurrentMood(mood);
    setTimeout(() => playRandom(), 500);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const seekTime = (e.target.value / 100) * duration;
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const isFavorite = (song) => {
    return favorites.some(fav => fav.url === song.url);
  };

  const toggleFavorite = (song) => {
    if (isFavorite(song)) {
      removeFromFavorites(song);
    } else {
      addToFavorites(song);
    }
  };

  const filteredSongs = allSongs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const moodEmojis = {
    love: '💖',
    happy: '😊',
    sad: '😢',
    energetic: '⚡',
    calm: '😌'
  };

  const moodColors = {
    love: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    happy: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    sad: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    energetic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    calm: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  };

  return (
    <div style={containerStyle}>
      <div style={animatedBgStyle}></div>

      {/* Header with Navigation */}
      <div style={headerStyle}>
        <div style={logoStyle}>
          <span style={logoIconStyle}>🎵</span>
          <span style={logoTextStyle}>SayPlay</span>
        </div>
        
        <div style={navStyle}>
          <button onClick={() => navigate('/player')} style={navBtnStyle}>🎧 Player</button>
          <button onClick={() => navigate('/favorites')} style={navBtnStyle}>💖 Favorites ({favorites.length})</button>
          <button onClick={() => navigate('/statistics')} style={navBtnStyle}>📊 Stats</button>
          
          <select 
            value={currentTheme} 
            onChange={(e) => setTheme(e.target.value)}
            style={themeSelectStyle}
          >
            {Object.entries(themes).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>

        <div style={userSectionStyle}>
          <div style={userAvatarStyle}>{username.charAt(0).toUpperCase()}</div>
          <span style={usernameStyle}>{username}</span>
          <button onClick={onLogout} style={logoutBtnStyle}>Logout</button>
        </div>
      </div>

      {/* Greeting */}
      <div style={greetingStyle}>
        <h2>{getTimeGreeting()}, {username}!</h2>
        <p>What would you like to listen to today?</p>
      </div>

      {/* Mood Selector */}
      <div style={moodContainerStyle}>
        <h3 style={sectionTitleStyle}>Choose Your Vibe</h3>
        <div style={moodGridStyle}>
          {Object.keys(moodEmojis).map(mood => (
            <div
              key={mood}
              onClick={() => setCurrentMood(mood)}
              style={{
                ...moodCardStyle,
                background: moodColors[mood],
                transform: currentMood === mood ? 'scale(1.05)' : 'scale(1)',
                boxShadow: currentMood === mood 
                  ? '0 20px 40px rgba(0,0,0,0.25)' 
                  : '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <div style={moodEmojiStyle}>{moodEmojis[mood]}</div>
              <div style={moodNameStyle}>{mood.toUpperCase()}</div>
              {currentMood === mood && <div style={activeDotStyle}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={mainGridStyle}>
        {/* Left - Song Library */}
        <div style={glassCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>🎧 Song Library</h3>
            <div style={viewToggleStyle}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{...viewBtnStyle, opacity: viewMode === 'grid' ? 1 : 0.5}}
              >
                ⊞
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{...viewBtnStyle, opacity: viewMode === 'list' ? 1 : 0.5}}
              >
                ☰
              </button>
            </div>
          </div>

          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="🔍 Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
            <button onClick={playRandom} style={shuffleBtnStyle}>🔀 Shuffle</button>
          </div>

          <div style={badgeContainerStyle}>
            <span style={badgeStyle}>{filteredSongs.length} songs</span>
            <span style={badgeStyle}>{currentMood} mood</span>
          </div>

          <div style={songScrollStyle}>
            {filteredSongs.map((song, index) => (
              <div key={index} style={songCardStyle} className="hover-lift">
                <div style={songIndexStyle}>{index + 1}</div>
                <div style={songInfoStyle}>
                  <div style={songTitleStyle}>{song.name}</div>
                  <div style={songSubtitleStyle}>{song.mood} vibes</div>
                </div>
                <div style={songActionsStyle}>
                  <button onClick={() => playSong(song)} style={playCircleBtnStyle}>▶</button>
                  <button onClick={() => toggleFavorite(song)} style={{...heartBtnStyle, color: isFavorite(song) ? '#f5576c' : '#ccc'}}>
                    {isFavorite(song) ? '💖' : '🤍'}
                  </button>
                  <button onClick={() => addToQueue(song)} style={queueBtnStyle}>➕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Now Playing & More */}
        <div style={rightColumnStyle}>
          {/* Now Playing */}
          <div style={nowPlayingCardStyle}>
            <div style={nowPlayingHeaderStyle}>
              <h3 style={cardTitleStyle}>🎵 Now Playing</h3>
              {currentSong && (
                <button onClick={() => setShowFullScreen(true)} style={expandBtnStyle}>⛶</button>
              )}
            </div>
            
            {currentSong ? (
              <div style={nowPlayingContentStyle}>
                <div style={albumArtStyle}>
                  <div style={pulseRingStyle}></div>
                  <div style={musicIconLargeStyle}>🎵</div>
                </div>
                <div style={songNameLargeStyle}>{currentSong.name}</div>
                <div style={songMoodLargeStyle}>{getMoodEmoji(currentSong.mood)} {currentSong.mood} mood</div>
                
                {/* Progress Bar */}
                <div style={progressContainerStyle}>
                  <span style={timeStyle}>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(currentTime / duration) * 100 || 0}
                    onChange={handleSeek}
                    style={progressBarStyle}
                  />
                  <span style={timeStyle}>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div style={controlsStyle}>
                  <button onClick={() => playRandom()} style={controlBtnStyle}>⏮️</button>
                  <button onClick={togglePlayPause} style={mainControlBtnStyle}>
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button onClick={() => playNextInQueue()} style={controlBtnStyle}>⏭️</button>
                </div>

                {/* Volume */}
                <div style={volumeContainerStyle}>
                  <span>🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    style={volumeSliderStyle}
                  />
                </div>

                {/* Quick Actions */}
                <div style={quickActionsStyle}>
                  <button onClick={() => toggleFavorite(currentSong)} style={quickActionBtnStyle}>
                    {isFavorite(currentSong) ? '💖 Favorited' : '🤍 Favorite'}
                  </button>
                  <button onClick={() => addToPlaylistDB(currentSong)} style={quickActionBtnStyle}>
                    ➕ Playlist
                  </button>
                </div>

                <audio 
                  ref={audioRef}
                  src={currentSong.url}
                  autoPlay 
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Visualizer */}
                <Visualizer 
                  audioElement={audioRef.current}
                  isPlaying={isPlaying}
                  currentMood={currentSong.mood}
                />
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>🎵</div>
                <div style={{color: '#555'}}>Select a song to start</div>
              </div>
            )}
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div style={glassCardStyle}>
              <h3 style={cardTitleStyle}>📋 Up Next ({queue.length})</h3>
              <div style={queueScrollStyle}>
                {queue.slice(0, 5).map((song, index) => (
                  <div key={index} style={queueItemStyle}>
                    <span style={{fontSize: '12px', color: '#666'}}>{index + 1}.</span>
                    <span style={{flex: 1, fontSize: '13px', color: '#333'}}>{song.name}</span>
                    <button onClick={() => setQueue(queue.filter((_, i) => i !== index))} style={miniRemoveStyle}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DB Playlist */}
          <div style={glassCardStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>📋 My Playlist</h3>
              <span style={badgeStyleSmall}>{playlist.length}</span>
            </div>
            <div style={playlistScrollStyle}>
              {playlist.slice(0, 5).map((song, index) => (
                <div key={index} style={playlistItemCardStyle}>
                  <div style={{flex: 1}}>
                    <div style={playlistSongNameStyle}>{song.name}</div>
                  </div>
                  <button onClick={() => playSong(song)} style={miniPlayStyle}>▶</button>
                  <button onClick={() => removeFromPlaylistDB(song)} style={miniRemoveStyle}>✕</button>
                </div>
              ))}
              {playlist.length === 0 && (
                <div style={emptyStateSmallStyle}>
                  <div style={{color: '#555'}}>No songs in playlist</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Control */}
      <VoiceControl onCommand={handleVoiceCommand} theme={theme} />
      
      {/* Face Detection */}
      <FaceDetection onMoodDetected={handleFaceMoodDetected} theme={theme} />

      {/* Mini Player (Sticky Bottom) */}
      {currentSong && !showFullScreen && (
        <div style={miniPlayerStyle}>
          <div style={miniPlayerContentStyle}>
            <div style={miniSongInfoStyle}>
              <span style={miniSongNameStyle}>🎵 {currentSong.name}</span>
              <span style={miniSongMoodStyle}>{currentSong.mood}</span>
            </div>
            <div style={miniControlsStyle}>
              <button onClick={() => playRandom()} style={miniControlBtnStyle}>⏮️</button>
              <button onClick={togglePlayPause} style={miniControlBtnStyle}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={() => playNextInQueue()} style={miniControlBtnStyle}>⏭️</button>
              <button onClick={() => toggleFavorite(currentSong)} style={miniControlBtnStyle}>
                {isFavorite(currentSong) ? '💖' : '🤍'}
              </button>
            </div>
          </div>
          <div style={miniProgressStyle}>
            <div style={{...miniProgressFillStyle, width: `${(currentTime / duration) * 100}%`}}></div>
          </div>
        </div>
      )}

      {/* Full Screen Player Modal */}
      {showFullScreen && currentSong && (
        <div style={fullScreenOverlayStyle} onClick={() => setShowFullScreen(false)}>
          <div style={fullScreenContentStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowFullScreen(false)} style={closeFullScreenStyle}>✕</button>
            
            <div style={fullScreenAlbumStyle}>
              <div style={fullScreenPulseStyle}></div>
              <div style={fullScreenIconStyle}>🎵</div>
            </div>
            
            <h2 style={fullScreenTitleStyle}>{currentSong.name}</h2>
            <p style={fullScreenSubtitleStyle}>{getMoodEmoji(currentSong.mood)} {currentSong.mood} mood</p>
            
            <div style={fullScreenProgressStyle}>
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
                style={fullScreenSliderStyle}
              />
              <span>{formatTime(duration)}</span>
            </div>
            
            <div style={fullScreenControlsStyle}>
              <button onClick={() => playRandom()} style={fullScreenControlBtnStyle}>⏮️</button>
              <button onClick={togglePlayPause} style={fullScreenMainBtnStyle}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={() => playNextInQueue()} style={fullScreenControlBtnStyle}>⏭️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 STYLES (Rest of the styles remain the same...)

const containerStyle = {
  minHeight: '100vh',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: '120px'
};

const animatedBgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  animation: 'float 20s ease-in-out infinite',
  pointerEvents: 'none'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  padding: '15px 30px',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.4)',
  marginBottom: '20px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  flexWrap: 'wrap',
  gap: '15px'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const logoIconStyle = {
  fontSize: '28px',
  animation: 'bounce 2s ease infinite'
};

const logoTextStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const navStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const navBtnStyle = {
  padding: '8px 16px',
  background: 'rgba(255, 255, 255, 0.5)',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px',
  transition: 'all 0.3s'
};

const themeSelectStyle = {
  padding: '8px 16px',
  background: 'rgba(255, 255, 255, 0.5)',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px'
};

const userSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const userAvatarStyle = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '16px',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const usernameStyle = {
  color: '#333',
  fontWeight: '700',
  fontSize: '14px'
};

const logoutBtnStyle = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
};

const greetingStyle = {
  textAlign: 'center',
  margin: '20px 0',
  color: '#333'
};

const moodContainerStyle = {
  marginBottom: '30px'
};

const sectionTitleStyle = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
  textAlign: 'center'
};

const moodGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '15px'
};

const moodCardStyle = {
  padding: '25px 15px',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  border: '2px solid rgba(255,255,255,0.5)',
  position: 'relative',
  overflow: 'hidden'
};

const moodEmojiStyle = {
  fontSize: '40px',
  textAlign: 'center',
  marginBottom: '8px'
};

const moodNameStyle = {
  textAlign: 'center',
  color: '#333',
  fontWeight: 'bold',
  fontSize: '13px',
  letterSpacing: '1px'
};

const activeDotStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: '#333',
  animation: 'pulse 1.5s ease infinite'
};

const mainGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '20px'
};

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '20px',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const cardTitleStyle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0
};

const viewToggleStyle = {
  display: 'flex',
  gap: '5px'
};

const viewBtnStyle = {
  width: '30px',
  height: '30px',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px'
};

const searchContainerStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '15px'
};

const searchInputStyle = {
  flex: 1,
  padding: '12px 15px',
  background: 'rgba(255,255,255,0.4)',
  border: '2px solid rgba(255,255,255,0.6)',
  borderRadius: '20px',
  color: '#333',
  fontSize: '13px',
  outline: 'none'
};

const shuffleBtnStyle = {
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)'
};

const badgeContainerStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '15px'
};

const badgeStyle = {
  background: 'rgba(102, 126, 234, 0.2)',
  color: '#333',
  padding: '5px 12px',
  borderRadius: '15px',
  fontSize: '11px',
  fontWeight: 'bold',
  border: '1px solid rgba(102, 126, 234, 0.3)'
};

const badgeStyleSmall = {
  background: 'rgba(102, 126, 234, 0.2)',
  color: '#333',
  padding: '3px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold'
};

const songScrollStyle = {
  maxHeight: '450px',
  overflowY: 'auto',
  paddingRight: '5px'
};

const songCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  background: 'rgba(255,255,255,0.3)',
  borderRadius: '12px',
  marginBottom: '8px',
  border: '1px solid rgba(255,255,255,0.4)',
  transition: 'all 0.3s',
  cursor: 'pointer'
};

const songIndexStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'rgba(102, 126, 234, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#333',
  fontSize: '11px',
  fontWeight: 'bold',
  border: '1px solid rgba(102, 126, 234, 0.3)'
};

const songInfoStyle = {
  flex: 1,
  minWidth: 0
};

const songTitleStyle = {
  color: '#333',
  fontWeight: 'bold',
  fontSize: '13px',
  marginBottom: '3px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const songSubtitleStyle = {
  color: '#666',
  fontSize: '11px'
};

const songActionsStyle = {
  display: 'flex',
  gap: '6px'
};

const playCircleBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const heartBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.3s'
};

const queueBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px'
};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const nowPlayingCardStyle = {
  background: 'rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '25px',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
};

const nowPlayingHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const expandBtnStyle = {
  width: '30px',
  height: '30px',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px'
};

const nowPlayingContentStyle = {
  textAlign: 'center'
};

const albumArtStyle = {
  width: '140px',
  height: '140px',
  margin: '15px auto',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
};

const pulseRingStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: '3px solid rgba(255,255,255,0.6)',
  animation: 'pulseRing 2s ease infinite'
};

const musicIconLargeStyle = {
  fontSize: '50px',
  animation: 'spin 4s linear infinite'
};

const songNameLargeStyle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '15px',
  marginBottom: '8px'
};

const songMoodLargeStyle = {
  color: '#666',
  fontSize: '13px',
  marginBottom: '15px'
};

const progressContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '15px'
};

const timeStyle = {
  fontSize: '11px',
  color: '#666',
  minWidth: '35px'
};

const progressBarStyle = {
  flex: 1,
  height: '6px',
  borderRadius: '3px',
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(0,0,0,0.1)'
};

const controlsStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  marginTop: '15px'
};

const controlBtnStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  transition: 'all 0.3s'
};

const mainControlBtnStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
};

const volumeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '15px',
  justifyContent: 'center'
};

const volumeSliderStyle = {
  width: '100px',
  height: '6px',
  borderRadius: '3px',
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(0,0,0,0.1)'
};

const quickActionsStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '15px'
};

const quickActionBtnStyle = {
  flex: 1,
  padding: '10px',
  background: 'rgba(255,255,255,0.5)',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '30px 15px'
};

const emptyIconStyle = {
  fontSize: '50px',
  marginBottom: '10px',
  opacity: 0.4
};

const emptyStateSmallStyle = {
  textAlign: 'center',
  padding: '25px 15px',
  color: '#666',
  fontSize: '13px'
};

const queueScrollStyle = {
  maxHeight: '150px',
  overflowY: 'auto'
};

const queueItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  background: 'rgba(255,255,255,0.3)',
  borderRadius: '10px',
  marginBottom: '6px'
};

const playlistScrollStyle = {
  maxHeight: '180px',
  overflowY: 'auto'
};

const playlistItemCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px',
  background: 'rgba(255,255,255,0.3)',
  borderRadius: '10px',
  marginBottom: '6px'
};

const playlistSongNameStyle = {
  color: '#333',
  fontSize: '12px',
  fontWeight: '600'
};

const miniPlayStyle = {
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '10px'
};

const miniRemoveStyle = {
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '12px'
};

// Mini Player (Sticky Bottom)
const miniPlayerStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderTop: '2px solid rgba(102, 126, 234, 0.3)',
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
  zIndex: 1000
};

const miniPlayerContentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 30px',
  maxWidth: '1400px',
  margin: '0 auto'
};

const miniSongInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  flex: 1
};

const miniSongNameStyle = {
  fontWeight: '600',
  fontSize: '14px',
  color: '#333'
};

const miniSongMoodStyle = {
  fontSize: '11px',
  color: '#666',
  background: 'rgba(102, 126, 234, 0.1)',
  padding: '3px 10px',
  borderRadius: '10px'
};

const miniControlsStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const miniControlBtnStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'rgba(102, 126, 234, 0.1)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.3s'
};

const miniProgressStyle = {
  height: '4px',
  background: 'rgba(0, 0, 0, 0.1)',
  position: 'relative'
};

const miniProgressFillStyle = {
  height: '100%',
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  transition: 'width 0.3s'
};

// Full Screen Player
const fullScreenOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.95)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)'
};

const fullScreenContentStyle = {
  textAlign: 'center',
  color: 'white',
  maxWidth: '600px',
  padding: '40px',
  position: 'relative'
};

const closeFullScreenStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.3)',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px'
};

const fullScreenAlbumStyle = {
  width: '250px',
  height: '250px',
  margin: '30px auto',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.5)'
};

const fullScreenPulseStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: '4px solid rgba(255,255,255,0.6)',
  animation: 'pulseRing 2s ease infinite'
};

const fullScreenIconStyle = {
  fontSize: '100px'
};

const fullScreenTitleStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  marginBottom: '10px'
};

const fullScreenSubtitleStyle = {
  fontSize: '18px',
  color: '#bbb',
  marginBottom: '40px'
};

const fullScreenProgressStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '40px',
  fontSize: '14px'
};

const fullScreenSliderStyle = {
  flex: 1,
  height: '8px',
  borderRadius: '4px',
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(255,255,255,0.2)'
};

const fullScreenControlsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '25px'
};

const fullScreenControlBtnStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.3)',
  color: 'white',
  cursor: 'pointer',
  fontSize: '24px'
};

const fullScreenMainBtnStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '32px',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)'
};

export default MusicPlayer;
