import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Statistics({ username, listeningHistory, theme }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!listeningHistory || listeningHistory.length === 0) {
      return {
        totalSongs: 0,
        totalTime: 0,
        topSongs: [],
        moodDistribution: {},
        weeklyActivity: []
      };
    }

    // Total songs played
    const totalSongs = listeningHistory.length;

    // Estimate total time (assume 3.5 min per song)
    const totalTime = totalSongs * 3.5;

    // Top 10 songs
    const songCounts = {};
    listeningHistory.forEach(song => {
      songCounts[song.name] = (songCounts[song.name] || 0) + 1;
    });
    const topSongs = Object.entries(songCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Mood distribution
    const moodCounts = {};
    listeningHistory.forEach(song => {
      moodCounts[song.mood] = (moodCounts[song.mood] || 0) + 1;
    });

    // Weekly activity (last 7 days)
    const today = new Date();
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const count = listeningHistory.filter(song => {
        const songDate = new Date(song.playedAt);
        return songDate.toDateString() === date.toDateString();
      }).length;
      
      weeklyActivity.push({ day: dateStr, count });
    }

    return {
      totalSongs,
      totalTime,
      topSongs,
      moodDistribution: moodCounts,
      weeklyActivity
    };
  }, [listeningHistory]);

  // Chart data
  const topSongsData = {
    labels: stats.topSongs.map(s => s.name.substring(0, 20)),
    datasets: [{
      label: 'Play Count',
      data: stats.topSongs.map(s => s.count),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2
    }]
  };

  const moodData = {
    labels: Object.keys(stats.moodDistribution),
    datasets: [{
      data: Object.values(stats.moodDistribution),
      backgroundColor: [
        'rgba(251, 194, 235, 0.8)',
        'rgba(255, 234, 167, 0.8)',
        'rgba(168, 237, 234, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(210, 153, 194, 0.8)'
      ],
      borderWidth: 2
    }]
  };

  const weeklyData = {
    labels: stats.weeklyActivity.map(d => d.day),
    datasets: [{
      label: 'Songs Played',
      data: stats.weeklyActivity.map(d => d.count),
      borderColor: theme.primary,
      backgroundColor: `${theme.primary}33`,
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={() => navigate('/player')} style={backButtonStyle}>
          ← Back to Player
        </button>
        <h2 style={titleStyle}>📊 Your Music Stats</h2>
      </div>

      {/* Summary Cards */}
      <div style={summaryGridStyle}>
        <div style={cardStyle}>
          <div style={cardIconStyle}>🎵</div>
          <div style={cardValueStyle}>{stats.totalSongs}</div>
          <div style={cardLabelStyle}>Total Songs Played</div>
        </div>
        
        <div style={cardStyle}>
          <div style={cardIconStyle}>⏱️</div>
          <div style={cardValueStyle}>{Math.floor(stats.totalTime / 60)}h {Math.floor(stats.totalTime % 60)}m</div>
          <div style={cardLabelStyle}>Total Listening Time</div>
        </div>
        
        <div style={cardStyle}>
          <div style={cardIconStyle}>💖</div>
          <div style={cardValueStyle}>
            {Object.keys(stats.moodDistribution).length > 0
              ? Object.entries(stats.moodDistribution).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'}
          </div>
          <div style={cardLabelStyle}>Favorite Mood</div>
        </div>
      </div>

      {/* Charts */}
      {stats.totalSongs > 0 ? (
        <>
          <div style={chartContainerStyle}>
            <h3 style={chartTitleStyle}>🏆 Top 10 Most Played Songs</h3>
            <div style={chartBoxStyle}>
              <Bar data={topSongsData} options={chartOptions} />
            </div>
          </div>

          <div style={chartsRowStyle}>
            <div style={chartContainerHalfStyle}>
              <h3 style={chartTitleStyle}>🎭 Mood Distribution</h3>
              <div style={chartBoxStyle}>
                <Pie data={moodData} options={chartOptions} />
              </div>
            </div>

            <div style={chartContainerHalfStyle}>
              <h3 style={chartTitleStyle}>📈 Weekly Activity</h3>
              <div style={chartBoxStyle}>
                <Line data={weeklyData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>📊</div>
          <p>No listening history yet. Start playing songs to see your stats!</p>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto'
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

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '30px',
  borderRadius: '20px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s'
};

const cardIconStyle = {
  fontSize: '48px',
  marginBottom: '15px'
};

const cardValueStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#667eea',
  marginBottom: '10px'
};

const cardLabelStyle = {
  fontSize: '14px',
  color: '#666',
  fontWeight: '500'
};

const chartContainerStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '30px',
  borderRadius: '20px',
  marginBottom: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const chartsRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '20px'
};

const chartContainerHalfStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '30px',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const chartTitleStyle = {
  color: '#333',
  fontSize: '20px',
  marginBottom: '20px',
  fontWeight: '600'
};

const chartBoxStyle = {
  height: '300px',
  position: 'relative'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const emptyIconStyle = {
  fontSize: '80px',
  marginBottom: '20px',
  opacity: 0.5
};

export default Statistics;