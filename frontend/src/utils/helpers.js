// Format seconds to MM:SS
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format duration in minutes to readable format
export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Calculate statistics from listening history
export const calculateStats = (history) => {
  if (!history || history.length === 0) {
    return {
      totalSongs: 0,
      totalTime: 0,
      topMood: 'N/A',
      averagePerDay: 0
    };
  }

  const totalSongs = history.length;
  const totalTime = totalSongs * 3.5; // Estimate 3.5 min per song

  // Calculate top mood
  const moodCounts = {};
  history.forEach(song => {
    moodCounts[song.mood] = (moodCounts[song.mood] || 0) + 1;
  });
  
  const topMood = Object.keys(moodCounts).length > 0
    ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  // Calculate average per day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSongs = history.filter(song => {
    return new Date(song.playedAt) >= sevenDaysAgo;
  }).length;
  
  const averagePerDay = Math.floor(recentSongs / 7);

  return {
    totalSongs,
    totalTime,
    topMood,
    averagePerDay
  };
};

// Get color for each mood
export const getMoodColor = (mood) => {
  const colors = {
    love: '#f093fb',
    happy: '#ffeaa7',
    sad: '#a8edea',
    energetic: '#fa709a',
    calm: '#d299c2'
  };
  
  return colors[mood] || '#667eea';
};

// Get gradient for each mood
export const getMoodGradient = (mood) => {
  const gradients = {
    love: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    happy: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    sad: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    energetic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    calm: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  };
  
  return gradients[mood] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

// Shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate share link (for future use)
export const generateShareLink = (playlistId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/playlist/${playlistId}`;
};

// Get emoji for mood
export const getMoodEmoji = (mood) => {
  const emojis = {
    love: '💖',
    happy: '😊',
    sad: '😢',
    energetic: '⚡',
    calm: '😌'
  };
  
  return emojis[mood] || '🎵';
};

// Get time of day greeting
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good Morning ☀️";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon 🌤️";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening 🌆";
  } else {
    return "Good Night 🌙";
  }
};

// Calculate listening streak (consecutive days)
export const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;
  
  const dates = history
    .map(song => new Date(song.playedAt).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  const today = new Date().toDateString();
  
  if (dates[0] !== today) return 0;
  
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak + 1;
};

// Export all functions as default object
export default {
  formatTime,
  formatDuration,
  calculateStats,
  getMoodColor,
  getMoodGradient,
  shuffleArray,
  generateShareLink,
  getMoodEmoji,
  getTimeGreeting,
  calculateStreak
};