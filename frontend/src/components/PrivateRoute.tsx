import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
  children: React.ReactNode
  requireChurch?: boolean
  requireRole?: string[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireChurch = false,
  requireRole = []
}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar si requiere iglesia
  if (requireChurch && !user?.has_church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Iglesia Requerida
          </h1>
          <p className="text-blue-200 mb-6">
            Esta sección requiere que tengas una iglesia registrada.
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Registrar Iglesia
          </button>
        </div>
      </div>
    )
  }

  // Verificar roles si se especifican
  if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-blue-200 mb-6">
            No tienes los permisos necesarios para acceder a esta sección.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Usuario autenticado y con permisos, mostrar contenido
  return <>{children}</>
}

export default PrivateRoute
