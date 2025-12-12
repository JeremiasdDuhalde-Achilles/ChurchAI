// src/components/members/MemberFilters.tsx
import React from 'react'
import { X } from 'lucide-react'
import { Button } from '../common/Button'

interface FilterValues {
  member_type: string
  risk_level: string
  member_status: string
}

interface MemberFiltersProps {
  filters: FilterValues
  setFilters: (filters: FilterValues) => void
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({ filters, setFilters }) => {
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    setFilters({
      member_type: '',
      risk_level: '',
      member_status: 'active'
    })
  }

  const hasActiveFilters = filters.member_type || filters.risk_level || filters.member_status !== 'active'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">Filtros</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={clearFilters}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Tipo de Miembro */}
        <div>
          <label className="block text-blue-200 text-sm font-medium mb-2">
            Tipo de Miembro
          </label>
          <select
            value={filters.member_type}
            onChange={(e) => handleFilterChange('member_type', e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="visitante">Visitantes</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {/* Nivel de Riesgo */}
        <div>
          <label className="block text-blue-200 text-sm font-medium mb-2">
            Nivel de Riesgo
          </label>
          <select
            value={filters.risk_level}
            onChange={(e) => handleFilterChange('risk_level', e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="bajo">Bajo</option>
            <option value="medio">Medio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-blue-200 text-sm font-medium mb-2">
            Estado
          </label>
          <select
            value={filters.member_status}
            onChange={(e) => handleFilterChange('member_status', e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.member_type && (
            <FilterChip
              label={`Tipo: ${filters.member_type}`}
              onRemove={() => handleFilterChange('member_type', '')}
            />
          )}
          {filters.risk_level && (
            <FilterChip
              label={`Riesgo: ${filters.risk_level}`}
              onRemove={() => handleFilterChange('risk_level', '')}
            />
          )}
          {filters.member_status !== 'active' && (
            <FilterChip
              label={`Estado: ${filters.member_status || 'todos'}`}
              onRemove={() => handleFilterChange('member_status', 'active')}
            />
          )}
        </div>
      )}
    </div>
  )
}

// Filter Chip Component
interface FilterChipProps {
  label: string
  onRemove: () => void
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}