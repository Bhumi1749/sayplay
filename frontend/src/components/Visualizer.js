import React, { useEffect, useRef, useState } from 'react';

function Visualizer({ audioElement, isPlaying, currentMood }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const moodColors = {
    love: ['#f093fb', '#f5576c', '#ff9a9e'],
    happy: ['#ffeaa7', '#fdcb6e', '#fab1a0'],
    sad: ['#a8edea', '#fed6e3', '#b2e7e8'],
    energetic: ['#fa709a', '#fee140', '#ff6b6b'],
    calm: ['#d299c2', '#fef9d7', '#a8c0ff']
  };

  useEffect(() => {
    if (!audioElement || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Create audio context if not exists
    if (!audioContextRef.current && audioElement) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioElement);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (error) {
        console.error('Error creating audio context:', error);
        return;
      }
    }

    const animate = () => {
      if (!isActive || !analyserRef.current || !dataArrayRef.current) return;

      animationRef.current = requestAnimationFrame(animate);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      const colors = moodColors[currentMood] || moodColors.calm;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, isActive, isPlaying, currentMood]);

  const toggleVisualizer = () => {
    setIsActive(!isActive);
  };

  return (
    <div style={containerStyle}>
      <button onClick={toggleVisualizer} style={toggleButtonStyle}>
        {isActive ? '📊 Hide Visualizer' : '📊 Show Visualizer'}
      </button>

      {isActive && (
        <div style={visualizerContainerStyle}>
          <canvas ref={canvasRef} style={canvasStyle} />
          {!isPlaying && (
            <div style={overlayStyle}>
              <p>▶️ Play music to see visualizer</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  marginTop: '20px'
};

const toggleButtonStyle = {
  width: '100%',
  padding: '12px',
  background: 'rgba(102, 126, 234, 0.1)',
  border: '2px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'all 0.3s',
  color: '#667eea'
};

const visualizerContainerStyle = {
  marginTop: '15px',
  background: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '15px',
  overflow: 'hidden',
  position: 'relative',
  height: '150px'
};

const canvasStyle = {
  width: '100%',
  height: '100%',
  display: 'block'
};

const overlayStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '14px',
  textAlign: 'center'
};

export default Visualizer;