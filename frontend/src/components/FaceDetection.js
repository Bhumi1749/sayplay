import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

function FaceDetection({ onMoodDetected }) {
  const videoRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentMood, setCurrentMood] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isDetecting && videoRef.current) {
      console.log('Starting detection interval...');
      detectionIntervalRef.current = setInterval(() => {
        detectFace();
      }, 2000);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isDetecting]);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      setIsModelLoaded(true);
      console.log('Face detection models loaded!');
    } catch (err) {
      console.error('Error loading models:', err);
      alert('Error loading AI models. Please refresh the page.');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video ready!');
          videoRef.current.play();
          setShowCamera(true);
          setIsDetecting(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsDetecting(false);
  };

  const detectFace = async () => {
    if (!videoRef.current || !isModelLoaded) {
      console.log('Cannot detect - video or model not ready');
      return;
    }

    if (videoRef.current.readyState !== 4) {
      console.log('Video not ready yet');
      return;
    }

    console.log('Detecting...');

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        console.log('✅ Face detected!');
        const expressions = detections.expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );

        const confidence = expressions[maxExpression];
        
        console.log(`Emotion: ${maxExpression} (${(confidence * 100).toFixed(1)}%)`);
        setCurrentMood(`${maxExpression} (${(confidence * 100).toFixed(0)}%)`);
        
        const moodMap = {
          'happy': 'happy',
          'sad': 'sad',
          'angry': 'energetic',
          'neutral': 'calm',
          'surprised': 'love',      // Changed from 'energetic' to 'love'
          'fearful': 'calm',
          'disgusted': 'calm'
        };

        const musicMood = moodMap[maxExpression] || 'calm';
        
        if (confidence > 0.4) {
          console.log(`🎵 Changing music to: ${musicMood}`);
          onMoodDetected(musicMood);
        }
      } else {
        console.log('❌ No face detected');
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  const toggleDetection = () => {
  console.log('Toggle clicked! Current detecting state:', isDetecting);
  console.log('Model loaded:', isModelLoaded);
  console.log('Video ref exists:', !!videoRef.current);
  
  if (!isDetecting) {
    console.log('Attempting to start camera...');
    startCamera();
  } else {
    console.log('Stopping camera...');
    stopCamera();
  }
};
  return (
  <div style={containerStyle}>
    <div>
      <p>Video Ref: {videoRef.current ? 'EXISTS' : 'NULL'}</p>
      <p>Model Loaded: {isModelLoaded ? 'YES' : 'NO'}</p>
      <p>Detecting: {isDetecting ? 'YES' : 'NO'}</p>
      <p>Show Camera: {showCamera ? 'YES' : 'NO'}</p>
    </div>
    
    <button 
      onClick={toggleDetection}
      style={{
        ...cameraButtonStyle,
        background: isDetecting 
          ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
      disabled={!isModelLoaded}
    >
      <span style={cameraIconStyle}>📸</span>
    </button>

    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        ...videoStyle,
        display: showCamera ? 'block' : 'none'
      }}
    />
    
    {currentMood && (
      <div style={moodDisplayStyle}>
        Detected: <strong>{currentMood}</strong>
      </div>
    )}

    {!isModelLoaded && (
      <div style={loadingTextStyle}>Loading AI models...</div>
    )}
  </div>
);
}

// Styles
const containerStyle = {
  position: 'fixed',
  bottom: '30px',
  left: '30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '15px',
  zIndex: 1000
};

const cameraButtonStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
  transition: 'all 0.3s'
};

const cameraIconStyle = {
  fontSize: '32px'
};

const cameraBoxStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  padding: '15px',
  borderRadius: '20px',
  border: '2px solid rgba(102, 126, 234, 0.3)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  position: 'relative'
};

const videoStyle = {
  width: '320px',
  height: '240px',
  borderRadius: '15px',
  transform: 'scaleX(-1)'
};

const moodDisplayStyle = {
  marginTop: '10px',
  padding: '10px 15px',
  background: 'rgba(102, 126, 234, 0.1)',
  borderRadius: '10px',
  textAlign: 'center',
  color: '#333',
  fontSize: '14px',
  fontWeight: '600'
};

const loadingTextStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '12px 18px',
  borderRadius: '12px',
  color: '#666',
  fontSize: '12px',
  fontWeight: '600'
};

const hintStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  padding: '12px 18px',
  borderRadius: '12px',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  maxWidth: '250px',
  color: '#666',
  fontSize: '12px',
  textAlign: 'center'
};

export default FaceDetection;