import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.username, data.userId);
        navigate('/player');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>🎵 Login to SayPlay</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        {error && <p style={errorStyle}>{error}</p>}
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account? 
        <span onClick={() => navigate('/register')} style={linkStyle}> Register here</span>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: '400px',
  margin: '50px auto',
  padding: '30px',
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '20px'
};

const inputStyle = {
  padding: '12px',
  fontSize: '16px',
  border: '2px solid #e0e0e0',
  borderRadius: '10px',
  transition: 'all 0.3s'
};

const buttonStyle = {
  padding: '12px',
  fontSize: '16px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s'
};

const errorStyle = {
  color: 'red',
  fontSize: '14px'
};

const linkStyle = {
  color: '#667eea',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Login;