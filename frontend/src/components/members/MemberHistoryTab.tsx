// src/components/members/MemberHistoryTab.tsx
import React from 'react'
import { Clock, User, Edit, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import { useQuery } from '@tanstack/react-query'
import { formatDateTime, formatRelativeDate } from '../../lib/utils'
import api from '../../services/api'

interface AuditLog {
  id: string
  member_id: string
  user_id: string | null
  action: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  changed_at: string
  user_name: string | null
}

interface MemberHistoryTabProps {
  memberId: string
}

export const MemberHistoryTab: React.FC<MemberHistoryTabProps> = ({ memberId }) => {
  const { data: history, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['member-history', memberId],
    queryFn: async () => {
      const response = await api.get(`/members/${memberId}/history`)
      return response.data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner text="Cargando historial..." size="lg" />
      </Card>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Clock}
          title="Sin historial"
          description="No hay cambios registrados para este miembro"
        />
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-6">
        Historial de Cambios
      </h3>

      {/* Timeline */}
      <div className="space-y-4">
        {history.map((log, index) => (
          <HistoryItem
            key={log.id}
            log={log}
            isLast={index === history.length - 1}
          />
        ))}
      </div>
    </Card>
  )
}

// ==================== HISTORY ITEM ====================

interface HistoryItemProps {
  log: AuditLog
  isLast: boolean
}

const HistoryItem: React.FC<HistoryItemProps> = ({ log, isLast }) => {
  const getActionIcon = () => {
    switch (log.action) {
      case 'create':
        return <Plus className="h-5 w-5 text-green-400" />
      case 'update':
        return <Edit className="h-5 w-5 text-blue-400" />
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getActionBadge = () => {
    switch (log.action) {
      case 'create':
        return <Badge variant="success">Creado</Badge>
      case 'update':
        return <Badge variant="info">Actualizado</Badge>
      case 'delete':
        return <Badge variant="danger">Eliminado</Badge>
      default:
        return <Badge variant="default">{log.action}</Badge>
    }
  }

  const getActionColor = () => {
    switch (log.action) {
      case 'create':
        return 'border-green-400/30 bg-green-500/10'
      case 'update':
        return 'border-blue-400/30 bg-blue-500/10'
      case 'delete':
        return 'border-red-400/30 bg-red-500/10'
      default:
        return 'border-gray-400/30 bg-gray-500/10'
    }
  }

  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      first_name: 'Nombre',
      last_name: 'Apellido',
      email: 'Email',
      phone: 'Teléfono',
      birth_date: 'Fecha de nacimiento',
      gender: 'Género',
      marital_status: 'Estado civil',
      member_type: 'Tipo de miembro',
      membership_date: 'Fecha de membresía',
      baptism_date: 'Fecha de bautismo',
      preferred_contact_method: 'Método de contacto'
    }
    return labels[fieldName] || fieldName
  }

  return (
    <div className="relative flex items-start space-x-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-white/10" />
      )}

      {/* Icon */}
      <div className={`
        relative z-10 flex-shrink-0 w-10 h-10 rounded-full 
        border-2 flex items-center justify-center
        ${getActionColor()}
      `}>
        {getActionIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            {getActionBadge()}
          </div>
          <div className="text-right">
            <div className="text-blue-200 text-sm">
              {formatRelativeDate(log.changed_at)}
            </div>
            <div className="text-blue-300 text-xs">
              {formatDateTime(log.changed_at)}
            </div>
          </div>
        </div>

        {/* Action description */}
        <div className="mt-2">
          {log.action === 'create' && (
            <p className="text-blue-100">
              Miembro creado en el sistema
            </p>
          )}

          {log.action === 'update' && log.field_name && (
            <div className="space-y-1">
              <p className="text-blue-100">
                Se modificó: <span className="font-semibold">{getFieldLabel(log.field_name)}</span>
              </p>
              
              {/* Old value */}
              {log.old_value && (
                <div className="flex items-start space-x-2 mt-2">
                  <span className="text-red-300 text-sm font-medium">Antes:</span>
                  <span className="text-red-200 text-sm bg-red-500/10 px-2 py-1 rounded">
                    {log.old_value}
                  </span>
                </div>
              )}
              
              {/* New value */}
              {log.new_value && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-300 text-sm font-medium">Ahora:</span>
                  <span className="text-green-200 text-sm bg-green-500/10 px-2 py-1 rounded">
                    {log.new_value}
                  </span>
                </div>
              )}
            </div>
          )}

          {log.action === 'delete' && (
            <p className="text-red-200">
              Miembro eliminado del sistema
            </p>
          )}
        </div>

        {/* User info */}
        {log.user_name && (
          <div className="flex items-center space-x-2 mt-2 text-sm text-blue-300">
            <User className="h-3 w-3" />
            <span>por {log.user_name}</span>
          </div>
        )}
      </div>
    </div>
  )
}