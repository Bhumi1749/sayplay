import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Favorites({ favorites, removeFromFavorites, theme }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const filteredFavorites = favorites
    .filter(song => song.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'mood') return a.mood.localeCompare(b.mood);
      return 0; // recent (default order)
    });

  // FIXED: Play song function
  const playSong = (song) => {
    console.log('🎵 Favorites - Playing:', song);
    sessionStorage.setItem('songToPlay', JSON.stringify(song));
    navigate('/player', { state: { songToPlay: song } });
  };

  const playAllShuffle = () => {
    if (favorites.length > 0) {
      const randomIndex = Math.floor(Math.random() * favorites.length);
      const randomSong = favorites[randomIndex];
      playSong(randomSong);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={() => navigate('/player')} style={backButtonStyle}>
          ← Back to Player
        </button>
        <h2 style={titleStyle}>💖 My Favorites</h2>
      </div>

      {favorites.length > 0 ? (
        <>
          <div style={controlsStyle}>
            <input
              type="text"
              placeholder="🔍 Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="recent">Recent</option>
              <option value="name">Name A-Z</option>
              <option value="mood">Mood</option>
            </select>

            <button onClick={playAllShuffle} style={shuffleButtonStyle}>
              🔀 Shuffle All
            </button>
          </div>

          <div style={statsRowStyle}>
            <div style={statCardStyle}>
              <span style={statIconStyle}>🎵</span>
              <span style={statValueStyle}>{favorites.length}</span>
              <span style={statLabelStyle}>Total Favorites</span>
            </div>
            
            <div style={statCardStyle}>
              <span style={statIconStyle}>🎭</span>
              <span style={statValueStyle}>
                {[...new Set(favorites.map(s => s.mood))].length}
              </span>
              <span style={statLabelStyle}>Different Moods</span>
            </div>
          </div>

          <div style={gridStyle}>
            {filteredFavorites.map((song, index) => (
              <div key={index} style={songCardStyle}>
                <div style={albumArtStyle}>
                  <div style={playIconStyle}>🎵</div>
                </div>
                
                <div style={songInfoStyle}>
                  <div style={songNameStyle}>{song.name}</div>
                  <div style={moodTagStyle}>{song.mood} mood</div>
                </div>

                <div style={actionsStyle}>
                  <button 
                    onClick={() => playSong(song)}
                    style={playBtnStyle}
                  >
                    ▶️
                  </button>
                  <button 
                    onClick={() => removeFromFavorites(song)}
                    style={removeBtnStyle}
                  >
                    💔
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredFavorites.length === 0 && (
            <div style={noResultsStyle}>
              <p>No favorites found matching "{searchTerm}"</p>
            </div>
          )}
        </>
      ) : (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>💔</div>
          <h3>No Favorites Yet</h3>
          <p>Start adding songs to your favorites by clicking the heart icon!</p>
          <button onClick={() => navigate('/player')} style={goBackButtonStyle}>
            Go to Music Player
          </button>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '80vh'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '30px'
};

const backButtonStyle = {
  padding: '10px 20px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '2px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'all 0.3s'
};

const titleStyle = {
  color: '#333',
  fontSize: '32px',
  margin: 0
};

const controlsStyle = {
  display: 'flex',
  gap: '15px',
  marginBottom: '30px',
  flexWrap: 'wrap'
};

const searchInputStyle = {
  flex: 1,
  minWidth: '250px',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '2px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '25px',
  fontSize: '14px',
  outline: 'none'
};

const selectStyle = {
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '2px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '25px',
  fontSize: '14px',
  cursor: 'pointer',
  outline: 'none'
};

const shuffleButtonStyle = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
  boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)'
};

const statsRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const statCardStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '20px',
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
};

const statIconStyle = {
  fontSize: '32px'
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#667eea'
};

const statLabelStyle = {
  fontSize: '12px',
  color: '#666'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px'
};

const songCardStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s',
  cursor: 'pointer'
};

const albumArtStyle = {
  width: '100%',
  height: '180px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '15px'
};

const playIconStyle = {
  fontSize: '48px',
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
};

const songInfoStyle = {
  marginBottom: '15px'
};

const songNameStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '8px'
};

const moodTagStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  background: 'rgba(102, 126, 234, 0.1)',
  color: '#667eea',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600'
};

const actionsStyle = {
  display: 'flex',
  gap: '10px'
};

const playBtnStyle = {
  flex: 1,
  padding: '10px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
};

const removeBtnStyle = {
  padding: '10px 20px',
  background: 'rgba(244, 67, 54, 0.1)',
  border: '2px solid rgba(244, 67, 54, 0.3)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '80px 20px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const emptyIconStyle = {
  fontSize: '100px',
  marginBottom: '20px',
  opacity: 0.5
};

const goBackButtonStyle = {
  marginTop: '20px',
  padding: '12px 30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
};

const noResultsStyle = {
  textAlign: 'center',
  padding: '40px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '15px',
  color: '#666'
};

export default Favorites;