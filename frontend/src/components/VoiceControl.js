import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function VoiceControl({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    processCommand(transcript);
  };

  const processCommand = (text) => {
  const lowerText = text.toLowerCase();
  
  // Mood commands
  if (lowerText.includes('play love') || lowerText.includes('love songs')) {
    onCommand({ type: 'changeMood', mood: 'love' });
  } else if (lowerText.includes('play happy') || lowerText.includes('happy songs')) {
    onCommand({ type: 'changeMood', mood: 'happy' });
  } else if (lowerText.includes('play sad') || lowerText.includes('sad songs')) {
    onCommand({ type: 'changeMood', mood: 'sad' });
  } else if (lowerText.includes('play energetic') || lowerText.includes('energetic songs') || lowerText.includes('energy')) {
    onCommand({ type: 'changeMood', mood: 'energetic' });
  } else if (lowerText.includes('play calm') || lowerText.includes('calm songs') || lowerText.includes('relax')) {
    onCommand({ type: 'changeMood', mood: 'calm' });
  }
  // Playback control commands
  else if (lowerText.includes('stop')) {
  onCommand({ type: 'pause' });
  }else if (lowerText.includes('resume') || lowerText.includes('continue') || lowerText.includes('play')) {
    onCommand({ type: 'resume' });
  }
  // Navigation commands
  else if (lowerText.includes('shuffle') || lowerText.includes('random')) {
    onCommand({ type: 'shuffle' });
  } else if (lowerText.includes('next') || lowerText.includes('skip')) {
    onCommand({ type: 'next' });
  }
  // View commands
  else if (lowerText.includes('show history') || lowerText.includes('recent') || lowerText.includes('history')) {
    onCommand({ type: 'showHistory' });
  } else if (lowerText.includes('show playlist') || lowerText.includes('my playlist')) {
    onCommand({ type: 'showPlaylist' });
  }
  // Playlist commands
  else if (lowerText.includes('add to playlist') || lowerText.includes('save song')) {
    onCommand({ type: 'addToPlaylist' });
  }
};

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <button 
        onClick={isListening ? stopListening : startListening}
        style={{
          ...micButtonStyle,
          background: isListening 
            ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          animation: isListening ? 'pulse 1s ease infinite' : 'none'
        }}
      >
        <span style={micIconStyle}>🎤</span>
      </button>
      
      {transcript && (
        <div style={transcriptBoxStyle}>
          <div style={transcriptLabelStyle}>You said:</div>
          <div style={transcriptTextStyle}>{transcript}</div>
        </div>
      )}
      
      <div style={commandsHintStyle}>
        {isListening ? (
          <div style={listeningTextStyle}>Listening... 🎧</div>
        ) : (
          <div style={hintTextStyle}>
  Click mic and say: "Play happy songs", "Stop", "Show history", "Shuffle"
</div>
        )}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  position: 'fixed',
  bottom: '30px',
  right: '30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '15px',
  zIndex: 1000
};

const micButtonStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
  transition: 'all 0.3s',
  position: 'relative'
};

const micIconStyle = {
  fontSize: '32px',
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
};

const transcriptBoxStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  padding: '15px 20px',
  borderRadius: '15px',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  maxWidth: '300px'
};

const transcriptLabelStyle = {
  fontSize: '11px',
  color: '#888',
  marginBottom: '5px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const transcriptTextStyle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600'
};

const commandsHintStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  padding: '12px 18px',
  borderRadius: '12px',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  maxWidth: '300px'
};

const listeningTextStyle = {
  color: '#f5576c',
  fontSize: '13px',
  fontWeight: 'bold',
  textAlign: 'center',
  animation: 'pulse 1s ease infinite'
};

const hintTextStyle = {
  color: '#666',
  fontSize: '12px',
  textAlign: 'center',
  lineHeight: '1.4'
};

export default VoiceControl;