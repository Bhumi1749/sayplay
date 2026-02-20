# 🎵 SayPlay - AI-Powered Music Streaming Platform

![Project Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-18-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.x-orange)

An intelligent music streaming platform that uses AI to detect your emotions through facial recognition and plays music matching your mood. Features voice-controlled playback for a hands-free experience.

---

## ✨ Features

- 🎭 **AI Mood Detection** - Real-time facial emotion recognition using TensorFlow.js
- 🎤 **Voice Control** - Hands-free music control via Web Speech API  
- 📊 **Listening Analytics** - Track listening habits with interactive Chart.js visualizations
- 💖 **Smart Playlists** - Automatic mood-based song curation
- 🎨 **Dynamic Themes** - 5 beautiful theme options (Sunset, Ocean, Dark, Minimal, Retro)
- 🎵 **Audio Visualizer** - Real-time music visualization
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Component-based UI framework
- **React Router DOM** - Client-side routing
- **TensorFlow.js** - Machine learning in the browser
- **face-api.js** - Pre-trained facial recognition models
- **Web Speech API** - Speech-to-text conversion
- **Chart.js** - Data visualization for listening statistics
- **Web Audio API** - Real-time audio frequency analysis

### Backend
- **Java Spring Boot 3.2** - REST API framework
- **Spring Data JPA** - Database ORM
- **H2 Database** - In-memory database (development)
- **Maven** - Dependency management
- **Lombok** - Boilerplate code reduction

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java JDK 17+
- Maven

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Bhumi1749/sayplay.git
cd sayplay
```

**2. Start Backend Server**
```bash
cd backend
mvn spring-boot:run
```
Backend will run on: `http://localhost:8081`

**3. Start Frontend (New Terminal)**
```bash
cd frontend
npm install
npm start
```
Frontend will open on: `http://localhost:3000`

**4. Default Login Credentials**
```
Username: test
Password: test123
```

---

## 🎯 How It Works

### Face Detection
1. User activates webcam
2. TensorFlow.js analyzes facial expressions every 2 seconds
3. Detects emotions: happy, sad, neutral, surprised, angry
4. Automatically plays mood-matching music with 85%+ accuracy

### Voice Control
**Supported commands:**
- "Play [mood] songs" - Changes mood and plays music
- "Pause" / "Resume" - Controls playback
- "Shuffle" / "Next" - Plays random song
- "Show history" - Opens statistics page
- "Show playlist" - Opens favorites page
- "Add to playlist" - Saves current song

### Mood-Based Music Categories
- **Love** 💖 - Romantic and soulful music
- **Happy** 😊 - Upbeat and cheerful songs
- **Sad** 😢 - Melancholic and emotional tracks
- **Energetic** ⚡ - High-energy and motivating music
- **Calm** 😌 - Relaxing and peaceful sounds

---

## 📂 Project Structure
```
sayplay/
├── backend/
│   ├── src/main/java/com/aimusic/backend/
│   │   ├── controller/       # REST API endpoints
│   │   │   ├── UserController.java
│   │   │   ├── MusicController.java
│   │   │   └── PlaylistController.java
│   │   ├── model/            # Entity classes
│   │   │   ├── User.java
│   │   │   └── Playlist.java
│   │   ├── repository/       # Database operations
│   │   │   ├── UserRepository.java
│   │   │   └── PlaylistRepository.java
│   │   └── service/          # Business logic
│   │       └── UserService.java
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   │   └── songs/            # Music files organized by mood
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── MusicPlayer.js
│   │   │   ├── VoiceControl.js
│   │   │   ├── FaceDetection.js
│   │   │   ├── Favorites.js
│   │   │   ├── Statistics.js
│   │   │   └── Visualizer.js
│   │   └── utils/            # Helper functions
│   │       └── helpers.js
│   └── package.json
│
└── README.md
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Create new user account |
| POST | `/api/users/login` | Authenticate user |
| GET | `/songs?mood={mood}` | Get songs by mood category |
| POST | `/api/playlist/add` | Add song to user's playlist |
| GET | `/api/playlist/get?userId={id}` | Get user's playlist |
| DELETE | `/api/playlist/remove/{id}` | Remove song from playlist |

---

## 🎨 Key Features Explained

### 1. Facial Emotion Recognition
- Uses TensorFlow.js and face-api.js pre-trained models
- Detects 7 emotions: happy, sad, neutral, angry, surprised, disgusted, fearful
- Updates mood selection automatically when confidence > 40%
- Non-intrusive - runs in background every 2 seconds

### 2. Voice Command System
- Powered by Web Speech API (browser-native)
- Natural language processing for command recognition
- Hands-free operation for accessibility
- Supports multiple command variations

### 3. Music Visualizer
- Real-time frequency analysis using Web Audio API
- Dynamic color schemes based on current mood
- 60 FPS smooth animations
- Responsive to audio beat and rhythm

### 4. Statistics Dashboard
- Total listening time tracking
- Most played moods analysis
- Chart.js visualizations
- Listening history with timestamps

---

## 🔮 Future Enhancements

- [ ] Spotify API integration for millions of songs
- [ ] Social sharing features and collaborative playlists
- [ ] Mobile app using React Native
- [ ] Advanced music recommendations using ML
- [ ] Offline playback support
- [ ] Song download functionality
- [ ] User-created playlists with custom names
- [ ] Friend system and activity feed
- [ ] Yearly listening wrapped summary

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Bhumika Sanjay Kalamkar**
- GitHub: [@Bhumi1749](https://github.com/Bhumi1749)
- Email: bhumikalamar1749@gmail.com

---

## 🙏 Acknowledgments

- TensorFlow.js team for face-api.js library
- Web Speech API documentation and community
- Chart.js for beautiful data visualizations
- Spring Boot community for excellent documentation
- React.js community for comprehensive resources

---

## 🐛 Known Issues

- Face detection requires good lighting conditions
- Voice recognition accuracy varies by browser (Chrome recommended)
- H2 database is in-memory (data resets on server restart)

---

## 📝 Notes

- This project was built as a learning exercise in full-stack development and AI integration
- Music files are stored locally in `frontend/public/songs/` organized by mood
- For production deployment, consider switching to PostgreSQL database
- Implement password hashing (BCrypt) and JWT tokens for production security

---

⭐ **If you find this project interesting, please give it a star!** ⭐

---

**Built with ❤️ and lots of ☕**
