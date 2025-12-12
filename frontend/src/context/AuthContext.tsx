import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
  can_create_church: boolean
  has_church: boolean
  church_id: string | null
  is_email_verified: boolean
  ai_approval_score: number | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<any>
  refreshToken: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))

          try {
            const response = await api.get('/v1/auth/me')
            setUser(response.data)
          } catch (error) {
            console.log('Token inválido, limpiando sesión')
            handleLogout()
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/v1/auth/login', { email, password })
      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(access_token)
      setUser(userData)

      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión')
    }
  }

  const register = async (data: any) => {
    try {
      const response = await api.post('/v1/auth/register', data)
      const { access_token, refresh_token } = response.data

      if (access_token) {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        setToken(access_token)

        const userResponse = await api.get('/v1/auth/me')

        setUser(userResponse.data)
        localStorage.setItem('user', JSON.stringify(userResponse.data))
      }

      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al registrar usuario')
    }
  }

  const logout = () => {
    handleLogout()
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token')
      if (!storedRefreshToken) throw new Error('No refresh token available')

      const response = await api.post('/v1/auth/refresh', {
        refresh_token: storedRefreshToken
      })

      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)
      setToken(access_token)

      return access_token
    } catch (error) {
      handleLogout()
      throw error
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
