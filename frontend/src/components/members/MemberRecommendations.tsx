// src/components/members/MemberRecommendations.tsx
import React from 'react'
import { 
  Target, AlertCircle, CheckCircle, Clock, 
  Mail, Phone, MessageCircle, User
} from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import type { Recommendation } from '../../types/member'

interface MemberRecommendationsProps {
  recommendations?: Recommendation
  isLoading: boolean
}

export const MemberRecommendations: React.FC<MemberRecommendationsProps> = ({
  recommendations,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner text="Generando recomendaciones..." size="lg" />
      </Card>
    )
  }

  if (!recommendations) {
    return (
      <Card>
        <EmptyState
          icon={Target}
          title="Sin recomendaciones"
          description="No hay recomendaciones disponibles para este miembro"
        />
      </Card>
    )
  }

  const priorityColors = {
    alta: 'from-red-600 to-orange-600',
    media: 'from-yellow-600 to-orange-600',
    baja: 'from-blue-600 to-cyan-600'
  }

  const priorityBadgeVariant = {
    alta: 'danger' as const,
    media: 'warning' as const,
    baja: 'info' as const
  }

  const channelIcons = {
    email: Mail,
    phone: Phone,
    whatsapp: MessageCircle,
    in_person: User
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card variant="gradient">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-white">
                {recommendations.member_name}
              </h3>
              <Badge variant={
                recommendations.risk_level === 'critico' || recommendations.risk_level === 'alto'
                  ? 'danger'
                  : recommendations.risk_level === 'medio'
                  ? 'warning'
                  : 'success'
              }>
                Riesgo: {recommendations.risk_level.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-blue-100 text-lg mb-4">
              {recommendations.ai_recommendation}
            </p>

            <div className="flex items-center space-x-2">
              <div className="text-white font-bold text-2xl">
                {recommendations.risk_score}
              </div>
              <div className="text-blue-200">/ 100 Score de Riesgo</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Factors */}
      {recommendations.risk_factors.length > 0 && (
        <Card variant="solid">
          <h3 className="text-xl font-bold text-white mb-4">
            Factores de Riesgo Identificados
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {recommendations.risk_factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommended Actions */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-6 w-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">
            Plan de Acción Recomendado
          </h3>
          <Badge variant="info">
            {recommendations.recommended_actions.length} acciones
          </Badge>
        </div>

        <div className="space-y-4">
          {recommendations.recommended_actions
            .sort((a, b) => {
              const priority = { alta: 3, media: 2, baja: 1 }
              return priority[b.priority] - priority[a.priority]
            })
            .map((action, index) => (
              <ActionCard
                key={index}
                action={action}
                index={index}
                priorityColors={priorityColors}
                priorityBadgeVariant={priorityBadgeVariant}
                channelIcons={channelIcons}
              />
            ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <h3 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            icon={<Mail className="h-5 w-5" />}
            fullWidth
          >
            Enviar Email
          </Button>
          <Button
            variant="secondary"
            icon={<Phone className="h-5 w-5" />}
            fullWidth
          >
            Llamar
          </Button>
          <Button
            variant="secondary"
            icon={<MessageCircle className="h-5 w-5" />}
            fullWidth
          >
            WhatsApp
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ==================== ACTION CARD ====================

interface ActionCardProps {
  action: any
  index: number
  priorityColors: Record<string, string>
  priorityBadgeVariant: Record<string, 'danger' | 'warning' | 'info'>
  channelIcons: Record<string, React.ElementType>
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  index,
  priorityColors,
  priorityBadgeVariant,
  channelIcons
}) => {
  const [completed, setCompleted] = React.useState(false)
  const ChannelIcon = channelIcons[action.channel] || User

  return (
    <Card
      variant={completed ? 'solid' : 'glass'}
      className={`
        transition-all duration-300
        ${completed ? 'opacity-60' : 'hover:scale-102'}
      `}
    >
      <div className="flex items-start space-x-4">
        {/* Number Badge */}
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-r ${priorityColors[action.priority]}
          flex items-center justify-center text-white font-bold text-xl flex-shrink-0
        `}>
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <Badge variant={priorityBadgeVariant[action.priority]}>
              Prioridad {action.priority.toUpperCase()}
            </Badge>
            <Badge variant="info">
              <ChannelIcon className="h-3 w-3 mr-1" />
              {action.channel}
            </Badge>
            {completed && (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completada
              </Badge>
            )}
          </div>

          <h4 className="text-white font-bold text-lg mb-2">
            {action.action}
          </h4>
          
          <p className="text-blue-200 text-sm mb-4">
            {action.reason}
          </p>

          <div className="flex items-center space-x-3">
            {!completed ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  icon={<CheckCircle className="h-4 w-4" />}
                  onClick={() => setCompleted(true)}
                >
                  Marcar como completada
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Clock className="h-4 w-4" />}
                >
                  Posponer
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompleted(false)}
              >
                Deshacer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}