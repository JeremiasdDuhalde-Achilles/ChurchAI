// src/components/members/MembersPage.tsx
import React, { useState } from 'react'
import { Plus, Search, Filter, RefreshCw, Download, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MembersTable } from './MembersTable'
import { MemberFilters } from './MemberFilters'
import { CreateMemberModal } from './CreateMemberModal'
import { useMembers, useRefreshMembersData } from '../../hooks/useMembers'
import { exportMembersToCSV, exportMembersToExcel } from '../../lib/exportMembers'
import { toast } from 'sonner'

export const MembersPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    member_type: '',
    risk_level: '',
    member_status: 'active'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data: members, isLoading } = useMembers({ 
    ...filters, 
    search,
    skip: page * pageSize,
    limit: pageSize
  })
  
  const refreshData = useRefreshMembersData()

  const handleRefresh = () => {
    refreshData()
  }

  const handleExportCSV = () => {
    if (members && members.length > 0) {
      exportMembersToCSV(members, 'miembros.csv')
      toast.success('✅ Archivo CSV descargado exitosamente')
    } else {
      toast.error('No hay miembros para exportar')
    }
  }

  const handleExportExcel = async () => {
    if (members && members.length > 0) {
      try {
        await exportMembersToExcel(members, 'miembros.xlsx')
        toast.success('✅ Archivo Excel descargado exitosamente')
      } catch (error) {
        toast.error('Error al exportar a Excel')
      }
    } else {
      toast.error('No hay miembros para exportar')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Miembros
            </h1>
            <p className="text-blue-200">
              Administra tu congregación con el poder de la IA
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              icon={<RefreshCw className="h-5 w-5" />}
              onClick={handleRefresh}
            >
              Actualizar
            </Button>
            
            {/* Dropdown Menu de Exportación */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button as={Fragment}>
                <Button 
                  variant="secondary" 
                  icon={<Download className="h-5 w-5" />}
                >
                  Exportar
                </Button>
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
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-800 border border-white/20 rounded-xl shadow-2xl focus:outline-none z-10">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleExportCSV}
                          className={`${
                            active ? 'bg-white/10' : ''
                          } group flex items-center w-full px-4 py-3 text-sm text-white rounded-lg transition-colors`}
                        >
                          <Download className="h-4 w-4 mr-3 text-green-400" />
                          <div className="text-left">
                            <div className="font-semibold">Exportar a CSV</div>
                            <div className="text-xs text-blue-300">
                              Archivo de texto compatible
                            </div>
                          </div>
                        </button>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleExportExcel}
                          className={`${
                            active ? 'bg-white/10' : ''
                          } group flex items-center w-full px-4 py-3 text-sm text-white rounded-lg transition-colors`}
                        >
                          <Download className="h-4 w-4 mr-3 text-blue-400" />
                          <div className="text-left">
                            <div className="font-semibold">Exportar a Excel</div>
                            <div className="text-xs text-blue-300">
                              Archivo .xlsx con formato
                            </div>
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <Button 
              variant="secondary"
              icon={<Upload className="h-5 w-5" />}
              onClick={() => navigate('/members/import')}
            >
              Importar
            </Button>
            
            <Button 
              variant="primary"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => setShowCreateModal(true)}
            >
              Agregar Miembro
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6" padding="md">
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <Button
              variant="secondary"
              icon={<Filter className="h-5 w-5" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
              {Object.values(filters).filter(v => v && v !== 'active').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {Object.values(filters).filter(v => v && v !== 'active').length}
                </span>
              )}
            </Button>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <MemberFilters filters={filters} setFilters={setFilters} />
            </div>
          )}
        </Card>

        {/* Results Summary */}
        {members && (
          <div className="mb-4">
            <p className="text-blue-200 text-sm">
              Mostrando {members.length} miembro{members.length !== 1 ? 's' : ''}
              {search && ` para "${search}"`}
            </p>
          </div>
        )}

        {/* Table */}
        <MembersTable 
          members={members || []} 
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />

        {/* Create Member Modal */}
        <CreateMemberModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  )
}