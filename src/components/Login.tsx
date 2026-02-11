import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ShieldCheck } from 'lucide-react'
import logo from '../assets/logo.png'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('isAdminAuthenticated', 'true')
          navigate('/enquiryform/admin')
        } else {
          setError(data.message || 'Invalid credentials')
        }
      })
      .catch(() => setError('Server connection failed'))
  }

  return (
    <div className="login-page">
      <div className="login-card-container">
        <div className="login-brand">
          <img src={logo} alt="ACE Logo" className="login-logo" />
          <h2>Admin Portal</h2>
          <p>Adhiyamaan College of Engineering</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-header">
            <ShieldCheck size={40} className="shield-icon" />
            <h3>Secure Login</h3>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="input-group-auth">
            <User size={20} className="auth-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group-auth">
            <Lock size={20} className="auth-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            ACCESS DASHBOARD
          </button>
        </form>
        
        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} ACE Admissions. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
