import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home.tsx'
import Login from './components/Login.tsx'
import AdminDashboard from './components/AdminDashboard.tsx'
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enquiryform/login" element={<Login />} />
        <Route path="/enquiryform/admin" element={<AdminDashboard />} />
        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
