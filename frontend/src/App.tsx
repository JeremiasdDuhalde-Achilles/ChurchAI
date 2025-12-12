// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Home from './components/Home'
import Login from './components/Login'
import UserRegister from './components/UserRegister'
import ChurchRegistration from './components/ChurchRegistration'
import Dashboard from './components/Dashboard'

// Members Pages
import { MembersPage } from './components/members/MembersPage'
import { MemberDetailPage } from './components/members/MemberDetailPage'
import { MemberEditPage } from './components/members/MemberEditPage'
import { ImportMembersPage } from './components/members/ImportMembersPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserRegister />} />
          
          {/* ==================== PROTECTED ROUTES ==================== */}
          
          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Church Registration */}
          <Route 
            path="/register" 
            element={
              <PrivateRoute>
                <ChurchRegistration />
              </PrivateRoute>
            } 
          />
          
          {/* ==================== MEMBERS ROUTES ==================== */}
          
          {/* Members List */}
          <Route 
            path="/members" 
            element={
              <PrivateRoute>
                <MembersPage />
              </PrivateRoute>
            } 
          />
          
          {/* Member Detail */}
          <Route 
            path="/members/:id" 
            element={
              <PrivateRoute>
                <MemberDetailPage />
              </PrivateRoute>
            } 
          />
          
          {/* Member Edit - TODO: Implementar componente de edición */}
          <Route 
            path="/members/:id/edit" 
            element={
              <PrivateRoute>
                <MemberEditPage />
              </PrivateRoute>
            } 
          />
          
          {/* ==================== FUTURE ROUTES ==================== */}
          
          <Route 
            path="/members/import" 
            element={
              <PrivateRoute>
                <ImportMembersPage />
              </PrivateRoute>
            } 
          />
          
          {/* Events */}
          <Route 
            path="/events" 
            element={
              <PrivateRoute>
                <PlaceholderPage title="Eventos" />
              </PrivateRoute>
            } 
          />
          
          {/* Reports */}
          <Route 
            path="/reports" 
            element={
              <PrivateRoute>
                <PlaceholderPage title="Reportes" />
              </PrivateRoute>
            } 
          />
          
          {/* Settings */}
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <PlaceholderPage title="Configuración" />
              </PrivateRoute>
            } 
          />
          
          {/* Profile */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <PlaceholderPage title="Mi Perfil" />
              </PrivateRoute>
            } 
          />
          
          {/* ==================== FALLBACK ==================== */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

// ==================== PLACEHOLDER COMPONENT ====================

interface PlaceholderPageProps {
  title: string
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
            <span className="text-4xl">🚧</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-blue-200 text-lg mb-6">
            Esta funcionalidad estará disponible próximamente
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default App