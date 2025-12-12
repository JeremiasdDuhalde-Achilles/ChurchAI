import React from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useMembersAtRisk } from '../../hooks/useMembers'
import { getRiskColor, getRiskBadgeVariant } from '../../lib/utils'

export const MembersAtRiskWidget: React.FC = () => {
  const { data: membersAtRisk, isLoading, error } = useMembersAtRisk()
  
  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner text="Cargando miembros en riesgo..." />
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <p className="text-red-400">Error al cargar miembros en riesgo</p>
      </Card>
    )
  }
  
  if (!membersAtRisk || membersAtRisk.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={AlertTriangle}
          title="¡Excelente! 🎉"
          description="No hay miembros en riesgo alto actualmente"
        />
      </Card>
    )
  }
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Miembros en Riesgo</h3>
            <p className="text-blue-200 text-sm">
              {membersAtRisk.length} {membersAtRisk.length === 1 ? 'miembro requiere' : 'miembros requieren'} atención
            </p>
          </div>
        </div>
        
        <Link to="/members?filter=at-risk">
          <Button variant="ghost" size="sm">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {membersAtRisk.slice(0, 5).map(member => (
          <Link
            key={member.id}
            to={`/members/${member.id}`}
            className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-blue-200 text-sm">
                  Última asistencia: {member.last_attendance || 'Sin registro'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {member.commitment_score !== undefined && (
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      {member.commitment_score.toFixed(0)}
                    </p>
                    <p className="text-blue-200 text-xs">Compromiso</p>
                  </div>
                )}
                
                <Badge variant={getRiskBadgeVariant(member.risk_level || 'bajo')}>
                  {member.risk_level?.toUpperCase() || 'BAJO'}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {membersAtRisk.length > 5 && (
        <div className="mt-4 text-center">
          <Link to="/members?filter=at-risk">
            <Button variant="secondary" size="sm" fullWidth>
              Ver {membersAtRisk.length - 5} más
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}