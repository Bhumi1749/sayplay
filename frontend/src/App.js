import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MusicPlayer from './components/MusicPlayer';
import Statistics from './components/Statistics';
import Favorites from './components/Favorites';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState('default');
  const [favorites, setFavorites] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space = pause/play
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const audio = document.querySelector('audio');
        if (audio) {
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleLogin = (user, id) => {
    setIsLoggedIn(true);
    setUsername(user);
    setUserId(id);
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem(`favorites_${id}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem(`history_${id}`);
    if (savedHistory) {
      setListeningHistory(JSON.parse(savedHistory));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId(null);
    setFavorites([]);
    setListeningHistory([]);
  };

  const addToFavorites = (song) => {
    if (!favorites.find(s => s.url === song.url)) {
      const newFavorites = [...favorites, song];
      setFavorites(newFavorites);
      
      // Save to localStorage
      if (userId) {
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
      }
    }
  };

  const removeFromFavorites = (song) => {
    const newFavorites = favorites.filter(s => s.url !== song.url);
    setFavorites(newFavorites);
    
    // Save to localStorage
    if (userId) {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    }
  };

  const addToHistory = (song) => {
    const newHistory = [
      { ...song, playedAt: new Date().toISOString() },
      ...listeningHistory.filter(s => s.url !== song.url)
    ].slice(0, 50); // Keep last 50
    
    setListeningHistory(newHistory);
    
    // Save to localStorage
    if (userId) {
      localStorage.setItem(`history_${userId}`, JSON.stringify(newHistory));
    }
  };

  const themes = {
    default: {
      name: 'Default Gradient',
      background: 'linear-gradient(135deg, #a8c0ff 0%, #c2e9fb 25%, #fbc2eb 50%, #a6c1ee 75%, #fbc2eb 100%)',
      primary: '#667eea',
      secondary: '#764ba2'
    },
    sunset: {
      name: 'Sunset Vibes',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #ffecd2 50%, #ff9a9e 75%, #fecfef 100%)',
      primary: '#ff6b6b',
      secondary: '#ee5a6f'
    },
    ocean: {
      name: 'Ocean Breeze',
      background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 25%, #a8edea 50%, #84fab0 75%, #8fd3f4 100%)',
      primary: '#56ab2f',
      secondary: '#a8e063'
    },
    dark: {
      name: 'Dark Neon',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #7474bf 50%, #1e3c72 75%, #2a5298 100%)',
      primary: '#e94560',
      secondary: '#0f3460'
    },
    minimal: {
      name: 'Minimal White',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 25%, #f5f7fa 50%, #c3cfe2 75%, #f5f7fa 100%)',
      primary: '#667eea',
      secondary: '#764ba2'
    }
  };

  return (
    <Router>
      <div className="App" style={{ background: themes[theme].background, minHeight: '100vh' }}>
        <header className="App-header" style={{ 
          background: `linear-gradient(135deg, ${themes[theme].primary} 0%, ${themes[theme].secondary} 100%)` 
        }}>
          <h1>🎵 SayPlay - AI Music Streaming</h1>
        </header>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/player" 
            element={
              isLoggedIn ? (
                <MusicPlayer 
                  username={username} 
                  userId={userId} 
                  onLogout={handleLogout}
                  theme={themes[theme]}
                  currentTheme={theme}
                  setTheme={setTheme}
                  themes={themes}
                  favorites={favorites}
                  addToFavorites={addToFavorites}
                  removeFromFavorites={removeFromFavorites}
                  addToHistory={addToHistory}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/statistics" 
            element={
              isLoggedIn ? (
                <Statistics 
                  username={username}
                  listeningHistory={listeningHistory}
                  theme={themes[theme]}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/favorites" 
            element={
              isLoggedIn ? (
                <Favorites 
                  favorites={favorites}
                  removeFromFavorites={removeFromFavorites}
                  theme={themes[theme]}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;