import React from 'react'
import { Users, UserCheck, UserX, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { Card } from '../common/Card'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useChurchStats } from '../../hooks/useMembers'
import { formatPercent } from '../../lib/utils'

export const StatsCards: React.FC = () => {
  const { data: stats, isLoading, error } = useChurchStats()
  
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse h-32" />
        ))}
      </div>
    )
  }
  
  if (error || !stats) {
    return (
      <Card>
        <p className="text-red-400">Error al cargar estadísticas</p>
      </Card>
    )
  }
  
  const cards = [
    {
      title: 'Total Miembros',
      value: stats.total_members.toString(),
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      change: '+12% este mes'
    },
    {
      title: 'Activos',
      value: stats.active_members.toString(),
      icon: UserCheck,
      color: 'from-green-600 to-emerald-600',
      percentage: `${((stats.active_members / stats.total_members) * 100).toFixed(0)}% del total`
    },
    {
      title: 'Visitantes',
      value: stats.visitors.toString(),
      icon: Activity,
      color: 'from-purple-600 to-pink-600'
    },
    {
      title: 'En Riesgo',
      value: stats.members_at_risk.toString(),
      icon: AlertTriangle,
      color: 'from-orange-600 to-red-600',
      alert: stats.members_at_risk > 5
    },
    {
      title: 'Asistencia Promedio',
      value: formatPercent(stats.average_attendance_rate),
      icon: TrendingUp,
      color: 'from-indigo-600 to-blue-600'
    },
    {
      title: 'Compromiso Promedio',
      value: `${stats.average_commitment_score.toFixed(0)}/100`,
      icon: Activity,
      color: 'from-yellow-600 to-orange-600'
    }
  ]
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className={card.alert ? 'border-red-500/50' : ''}>
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            {card.alert && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">
                ⚠️ Atención
              </span>
            )}
          </div>
          
          <p className="text-blue-200 text-sm mb-1">{card.title}</p>
          <p className="text-white text-3xl font-bold mb-2">{card.value}</p>
          
          {card.change && (
            <p className="text-green-400 text-sm">{card.change}</p>
          )}
          {card.percentage && (
            <p className="text-blue-300 text-sm">{card.percentage}</p>
          )}
        </Card>
      ))}
    </div>
  )
}