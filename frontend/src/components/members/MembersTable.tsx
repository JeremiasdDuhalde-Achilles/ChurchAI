// src/components/members/MembersTable.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Mail, Phone, Calendar, TrendingUp, AlertTriangle, 
  ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import { Button } from '../common/Button'
import type { Member } from '../../types/member'
import { getRiskBadgeVariant, getCommitmentColor, formatDate } from '../../lib/utils'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface MembersTableProps {
  members: Member[]
  isLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  isLoading,
  page,
  pageSize,
  onPageChange
}) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner text="Cargando miembros..." size="lg" />
      </Card>
    )
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={AlertTriangle}
          title="No hay miembros"
          description="No se encontraron miembros con los filtros seleccionados. Intenta ajustar los filtros o agrega nuevos miembros."
          action={
            <Button onClick={() => navigate('/members/new')}>
              Agregar Primer Miembro
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <Card padding="none">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Miembro
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Compromiso
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Riesgo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Última Asistencia
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-blue-200 text-sm">
          Mostrando {page * pageSize + 1} - {Math.min((page + 1) * pageSize, members.length)} de {members.length}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            Anterior
          </Button>
          
          <span className="px-4 py-2 bg-white/5 rounded-lg text-white text-sm">
            Página {page + 1}
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={members.length < pageSize}
          >
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ==================== MEMBER ROW ====================

interface MemberRowProps {
  member: Member
}

const MemberRow: React.FC<MemberRowProps> = ({ member }) => {
  const navigate = useNavigate()

  const handleView = () => {
    navigate(`/members/${member.id}`)
  }

  const handleEdit = () => {
    navigate(`/members/${member.id}/edit`)
  }

  const handleDelete = () => {
    // TODO: Implementar confirmación de eliminación
    console.log('Delete member:', member.id)
  }

  return (
    <tr 
      className="hover:bg-white/5 transition-colors cursor-pointer"
      onClick={handleView}
    >
      {/* Nombre */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {member.first_name[0]}{member.last_name[0]}
          </div>
          <div className="ml-4">
            <div className="text-white font-semibold">
              {member.first_name} {member.last_name}
            </div>
            {member.ministries && member.ministries.length > 0 && (
              <div className="text-blue-300 text-xs">
                {member.ministries.slice(0, 2).join(', ')}
                {member.ministries.length > 2 && ` +${member.ministries.length - 2}`}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Contacto */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {member.email && (
            <div className="flex items-center text-blue-200 text-sm">
              <Mail className="h-3 w-3 mr-2" />
              {member.email}
            </div>
          )}
          {member.phone && (
            <div className="flex items-center text-blue-200 text-sm">
              <Phone className="h-3 w-3 mr-2" />
              {member.phone}
            </div>
          )}
        </div>
      </td>

      {/* Tipo */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={
          member.member_type === 'activo' ? 'success' : 
          member.member_type === 'visitante' ? 'info' : 
          'default'
        }>
          {member.member_type.toUpperCase()}
        </Badge>
      </td>

      {/* Compromiso */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <TrendingUp className={`h-4 w-4 ${getCommitmentColor(member.commitment_score || 0)}`} />
          <span className={`font-bold ${getCommitmentColor(member.commitment_score || 0)}`}>
            {member.commitment_score?.toFixed(0) || 0}
          </span>
          <span className="text-blue-300 text-sm">/100</span>
        </div>
      </td>

      {/* Riesgo */}
      <td className="px-6 py-4 whitespace-nowrap">
        {member.risk_level && (
          <Badge variant={getRiskBadgeVariant(member.risk_level)}>
            {member.risk_level.toUpperCase()}
          </Badge>
        )}
      </td>

      {/* Última Asistencia */}
      <td className="px-6 py-4 whitespace-nowrap">
        {member.last_attendance ? (
          <div className="flex items-center text-blue-200 text-sm">
            <Calendar className="h-3 w-3 mr-2" />
            {formatDate(member.last_attendance)}
          </div>
        ) : (
          <span className="text-blue-300 text-sm">Sin registro</span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
        <ActionsMenu
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </td>
    </tr>
  )
}

// ==================== ACTIONS MENU ====================

interface ActionsMenuProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ onView, onEdit, onDelete }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
        <MoreVertical className="h-5 w-5 text-blue-200" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-slate-800 border border-white/20 rounded-xl shadow-2xl focus:outline-none z-10">
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onView}
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-white rounded-lg transition-colors`}
                >
                  <Eye className="h-4 w-4 mr-3 text-blue-400" />
                  Ver Detalles
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onEdit}
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-white rounded-lg transition-colors`}
                >
                  <Edit className="h-4 w-4 mr-3 text-green-400" />
                  Editar
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-red-400 rounded-lg transition-colors`}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}