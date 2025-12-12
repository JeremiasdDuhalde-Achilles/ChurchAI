// src/components/members/MemberDetailPage.tsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, MapPin,
  Users, Heart, TrendingUp, AlertTriangle, RefreshCw, Sparkles, Clock
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { MemberAIInsights } from './MemberAIInsights'
import { MemberRecommendations } from './MemberRecommendations'
import { MemberHistoryTab } from './MemberHistoryTab'
import {
  useMember,
  useMemberAIInsights,
  useMemberRecommendations,
  useRecalculateMemberScores,
  useDeleteMember
} from '../../hooks/useMembers'
import { getRiskBadgeVariant, getCommitmentColor, formatDate } from '../../lib/utils'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'info' | 'ai' | 'recommendations' | 'history'>('info')

  const { data: member, isLoading } = useMember(id)
  const { data: aiInsights, isLoading: aiLoading } = useMemberAIInsights(id)
  const { data: recommendations, isLoading: recsLoading } = useMemberRecommendations(id)
  const recalculate = useRecalculateMemberScores()
  const deleteMember = useDeleteMember()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRecalculate = async () => {
    if (id) {
      await recalculate.mutateAsync(id)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    try {
      await deleteMember.mutateAsync(id)
      setShowDeleteConfirm(false)
      navigate('/members')
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <Card>
          <LoadingSpinner text="Cargando información del miembro..." size="lg" />
        </Card>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Miembro no encontrado</h2>
            <Button onClick={() => navigate('/members')}>
              Volver a la lista
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate('/members')}
            >
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {member.first_name} {member.last_name}
              </h1>
              <p className="text-blue-200">Perfil del miembro</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              icon={<RefreshCw className="h-5 w-5" />}
              onClick={handleRecalculate}
              isLoading={recalculate.isPending}
            >
              Recalcular IA
            </Button>
            <Button
              variant="secondary"
              icon={<Edit className="h-5 w-5" />}
              onClick={() => navigate(`/members/${id}/edit`)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="h-5 w-5" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Eliminar
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-8" variant="gradient">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {member.first_name[0]}{member.last_name[0]}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {member.first_name} {member.last_name}
                </h2>
                <Badge variant={
                  member.member_type === 'activo' ? 'success' :
                  member.member_type === 'visitante' ? 'info' :
                  'default'
                }>
                  {member.member_type.toUpperCase()}
                </Badge>
                {member.risk_level && (
                  <Badge variant={getRiskBadgeVariant(member.risk_level)}>
                    Riesgo: {member.risk_level.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {member.email && (
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}
                {member.birth_date && (
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(member.birth_date)}</span>
                  </div>
                )}
                {member.membership_date && (
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Miembro desde {formatDate(member.membership_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getCommitmentColor(member.commitment_score || 0)}`}>
                  {member.commitment_score?.toFixed(0) || 0}
                </div>
                <div className="text-blue-200 text-sm">Compromiso</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {member.attendance_rate?.toFixed(0) || 0}%
                </div>
                <div className="text-blue-200 text-sm">Asistencia</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-white/10">
            <TabButton
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
              icon={<Users className="h-5 w-5" />}
            >
              Información
            </TabButton>
            <TabButton
              active={activeTab === 'ai'}
              onClick={() => setActiveTab('ai')}
              icon={<Sparkles className="h-5 w-5" />}
            >
              AI Insights
            </TabButton>
            <TabButton
              active={activeTab === 'recommendations'}
              onClick={() => setActiveTab('recommendations')}
              icon={<TrendingUp className="h-5 w-5" />}
            >
              Recomendaciones
            </TabButton>
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<Clock className="h-5 w-5" />}
            >
              Historial
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && <InfoTab member={member} />}
        {activeTab === 'ai' && (
          <MemberAIInsights
            insights={aiInsights}
            isLoading={aiLoading}
          />
        )}
        {activeTab === 'recommendations' && (
          <MemberRecommendations
            recommendations={recommendations}
            isLoading={recsLoading}
          />
        )}
        {activeTab === 'history' && (
          <MemberHistoryTab memberId={id!} />
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          memberName={`${member.first_name} ${member.last_name}`}
          isDeleting={deleteMember.isPending}
        />
      </div>
    </div>
  )
}

// ==================== TAB BUTTON ====================

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, children }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-6 py-3 font-semibold transition-all
        ${active
          ? 'text-white border-b-2 border-blue-500'
          : 'text-blue-300 hover:text-white'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

// ==================== INFO TAB ====================

interface InfoTabProps {
  member: any
}

const InfoTab: React.FC<InfoTabProps> = ({ member }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Personal Info */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Información Personal</h3>
        <div className="space-y-3">
          <InfoRow label="Género" value={member.gender || 'No especificado'} />
          <InfoRow label="Estado Civil" value={member.marital_status || 'No especificado'} />
          <InfoRow label="Fecha de Nacimiento" value={member.birth_date ? formatDate(member.birth_date) : 'No especificada'} />
          <InfoRow label="Contacto Preferido" value={member.preferred_contact_method || 'No especificado'} />
        </div>
      </Card>

      {/* Church Info */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Información de Iglesia</h3>
        <div className="space-y-3">
          <InfoRow label="Fecha de Membresía" value={member.membership_date ? formatDate(member.membership_date) : 'No especificada'} />
          <InfoRow label="Fecha de Bautismo" value={member.baptism_date ? formatDate(member.baptism_date) : 'No especificada'} />
          <InfoRow label="Última Asistencia" value={member.last_attendance ? formatDate(member.last_attendance) : 'Sin registro'} />
          <InfoRow label="Tasa de Asistencia" value={`${member.attendance_rate?.toFixed(1) || 0}%`} />
        </div>
      </Card>

      {/* Ministries */}
      {member.ministries && member.ministries.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Ministerios</h3>
          <div className="flex flex-wrap gap-2">
            {member.ministries.map((ministry: string, index: number) => (
              <Badge key={index} variant="info">
                {ministry}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Spiritual Gifts */}
      {member.spiritual_gifts && member.spiritual_gifts.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Dones Espirituales</h3>
          <div className="flex flex-wrap gap-2">
            {member.spiritual_gifts.map((gift: string, index: number) => (
              <Badge key={index} variant="success">
                <Heart className="h-3 w-3 mr-1" />
                {gift}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ==================== INFO ROW ====================

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <span className="text-blue-200 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}