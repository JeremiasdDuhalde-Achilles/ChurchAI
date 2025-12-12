// src/components/Dashboard.tsx
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Church,
  LogOut,
  Settings,
  Users,
  Calendar,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react'

// Importar nuevos componentes
import { StatsCards } from './dashboard/StatsCards'
import { MembersAtRiskWidget } from './dashboard/MembersAtRiskWidget'
import { Card } from './common/Card'

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  // Determinar estado del usuario
  const isApproved = user.can_create_church
  const hasChurch = user.has_church
  const isPending = user.status === 'pending_approval'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-white/20 backdrop-blur-lg p-3 rounded-xl border border-white/30">
                  <Church className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ChurchAI</h1>
                <p className="text-blue-200 text-xs">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-white/80 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-blue-200 text-xs capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Status Banner - Pending Approval */}
        {isPending && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-6 mb-8 flex items-start space-x-4">
            <Clock className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                Cuenta en Revisión
              </h3>
              <p className="text-yellow-100 mb-4">
                Tu cuenta está siendo revisada por nuestro equipo. Te notificaremos cuando esté lista.
              </p>
              <div className="flex items-center text-yellow-200 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Score IA: {user.ai_approval_score ? (user.ai_approval_score * 100).toFixed(0) : 'N/A'}%
              </div>
            </div>
          </div>
        )}

        {/* Status Banner - Approved but No Church */}
        {isApproved && !hasChurch && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-8 flex items-start space-x-4">
            <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                ¡Cuenta Aprobada!
              </h3>
              <p className="text-green-100 mb-4">
                Tu cuenta ha sido aprobada. Ya puedes registrar tu iglesia y comenzar a usar todas las funcionalidades.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Church className="mr-2 h-5 w-5" />
                Registrar Mi Iglesia
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {user.first_name}! 👋
          </h2>
          <p className="text-blue-200 text-lg">
            Gestiona tu ministerio con el poder de la Inteligencia Artificial
          </p>
        </div>

        {/* Stats Grid - NUEVO: Usando StatsCards con datos reales */}
        {hasChurch ? (
          <>
            <div className="mb-8">
              <StatsCards />
            </div>

            {/* Members at Risk Widget + Future Widgets */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <MembersAtRiskWidget />
              
              {/* Placeholder for future widget (Events, etc.) */}
              <Card variant="glass">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-purple-500/20 mb-4">
                    <Calendar className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Próximos Eventos
                  </h3>
                  <p className="text-blue-200 mb-4">
                    Gestión de eventos disponible próximamente
                  </p>
                  <button className="text-blue-400 text-sm hover:text-blue-300">
                    Más información →
                  </button>
                </div>
              </Card>
            </div>
          </>
        ) : (
          // Si no tiene iglesia, mostrar las tarjetas estáticas originales
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<User className="h-8 w-8" />}
              title="Perfil"
              value={user.status === 'active' ? 'Activo' : 'Pendiente'}
              color="from-blue-600 to-cyan-600"
              status={user.status === 'active' ? 'success' : 'warning'}
            />
            
            <StatCard
              icon={<Church className="h-8 w-8" />}
              title="Iglesia"
              value={hasChurch ? 'Registrada' : 'Sin Registrar'}
              color="from-purple-600 to-pink-600"
              status={hasChurch ? 'success' : 'info'}
            />
            
            <StatCard
              icon={<Users className="h-8 w-8" />}
              title="Miembros"
              value="0"
              color="from-green-600 to-emerald-600"
              status="info"
            />
            
            <StatCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Score IA"
              value={user.ai_approval_score ? `${(user.ai_approval_score * 100).toFixed(0)}%` : 'N/A'}
              color="from-yellow-600 to-orange-600"
              status="info"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!hasChurch && isApproved && (
              <ActionCard
                icon={<Church className="h-6 w-6" />}
                title="Registrar Iglesia"
                description="Comienza registrando tu iglesia"
                link="/register"
                color="from-blue-600 to-purple-600"
              />
            )}
            
            <ActionCard
              icon={<User className="h-6 w-6" />}
              title="Mi Perfil"
              description="Edita tu información personal"
              link="/profile"
              color="from-cyan-600 to-blue-600"
            />
            
            <ActionCard
              icon={<Users className="h-6 w-6" />}
              title="Gestionar Miembros"
              description="Administra tu congregación"
              link="/members"
              color="from-green-600 to-emerald-600"
              disabled={!hasChurch}
            />
            
            <ActionCard
              icon={<Calendar className="h-6 w-6" />}
              title="Eventos"
              description="Planifica y gestiona eventos"
              link="/events"
              color="from-purple-600 to-pink-600"
              disabled={!hasChurch}
            />
            
            <ActionCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Reportes"
              description="Visualiza métricas y estadísticas"
              link="/reports"
              color="from-orange-600 to-red-600"
              disabled={!hasChurch}
            />
            
            <ActionCard
              icon={<Settings className="h-6 w-6" />}
              title="Configuración"
              description="Ajusta preferencias del sistema"
              link="/settings"
              color="from-gray-600 to-slate-600"
            />
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Información de la Cuenta</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem label="Nombre Completo" value={`${user.first_name} ${user.last_name}`} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Rol" value={user.role.replace('_', ' ').toUpperCase()} />
            <InfoItem label="Estado" value={user.status.replace('_', ' ').toUpperCase()} />
            <InfoItem 
              label="Email Verificado" 
              value={user.is_email_verified ? '✅ Sí' : '❌ No'} 
            />
            <InfoItem 
              label="Puede Crear Iglesia" 
              value={user.can_create_church ? '✅ Sí' : '❌ No'} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================

// StatCard Component (para cuando no hay iglesia)
interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  color: string
  status: 'success' | 'warning' | 'info'
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, status }) => {
  const statusColors = {
    success: 'border-green-400/30 bg-green-500/20',
    warning: 'border-yellow-400/30 bg-yellow-500/20',
    info: 'border-blue-400/30 bg-blue-500/20'
  }

  return (
    <div className={`${statusColors[status]} border rounded-2xl p-6`}>
      <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r ${color} mb-4`}>
        {icon}
      </div>
      <p className="text-blue-200 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  )
}

// ActionCard Component
interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  color: string
  disabled?: boolean
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  icon, title, description, link, color, disabled = false 
}) => {
  if (disabled) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 opacity-50 cursor-not-allowed">
        <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r ${color} mb-4`}>
          {icon}
        </div>
        <h4 className="text-white font-bold mb-2">{title}</h4>
        <p className="text-blue-200 text-sm mb-4">{description}</p>
        <span className="text-xs text-yellow-400">
          🔒 Requiere iglesia registrada
        </span>
      </div>
    )
  }

  return (
    <Link
      to={link}
      className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 group"
    >
      <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r ${color} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-white font-bold mb-2 group-hover:text-blue-300 transition-colors">
        {title}
      </h4>
      <p className="text-blue-200 text-sm">{description}</p>
    </Link>
  )
}

// InfoItem Component
interface InfoItemProps {
  label: string
  value: string
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-blue-200 text-sm mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  )
}

export default Dashboard