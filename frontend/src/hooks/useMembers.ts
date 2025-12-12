// src/hooks/useMembers.ts
// Custom hooks para gestión de miembros con React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getChurchStats,
  getMembersAtRisk,
  getMemberAIInsights,
  getMemberRecommendations,
  recalculateMemberScores,
  createPastoralNote,
  getMemberNotes,
  recordAttendance,
  getMemberAttendance
} from '../api/members'
import { toast } from 'sonner'
import type { MemberCreate, MemberUpdate } from '../types/members'

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de miembros con filtros
 */
export const useMembers = (params?: any) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => getMembers(params),
    staleTime: 30000, // 30 segundos
  })
}

/**
 * Hook para obtener un miembro específico por ID
 */
export const useMember = (id: string | undefined) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => getMemberById(id!),
    enabled: !!id,
  })
}

/**
 * Hook para obtener estadísticas de la iglesia
 */
export const useChurchStats = () => {
  return useQuery({
    queryKey: ['church-stats'],
    queryFn: getChurchStats,
    staleTime: 60000, // 1 minuto
  })
}

/**
 * Hook para obtener miembros en riesgo
 */
export const useMembersAtRisk = () => {
  return useQuery({
    queryKey: ['members-at-risk'],
    queryFn: getMembersAtRisk,
    staleTime: 30000,
  })
}

/**
 * Hook para obtener AI insights de un miembro
 */
export const useMemberAIInsights = (id: string | undefined) => {
  return useQuery({
    queryKey: ['member-ai-insights', id],
    queryFn: () => getMemberAIInsights(id!),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Hook para obtener recomendaciones de un miembro
 */
export const useMemberRecommendations = (id: string | undefined) => {
  return useQuery({
    queryKey: ['member-recommendations', id],
    queryFn: () => getMemberRecommendations(id!),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Hook para obtener notas pastorales
 */
export const useMemberNotes = (id: string | undefined) => {
  return useQuery({
    queryKey: ['member-notes', id],
    queryFn: () => getMemberNotes(id!),
    enabled: !!id,
  })
}

/**
 * Hook para obtener historial de asistencia
 */
export const useMemberAttendance = (id: string | undefined, limit?: number) => {
  return useQuery({
    queryKey: ['member-attendance', id, limit],
    queryFn: () => getMemberAttendance(id!, limit),
    enabled: !!id,
  })
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear un nuevo miembro
 */
export const useCreateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MemberCreate) => createMember(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['church-stats'] })
      toast.success('Miembro creado exitosamente')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al crear miembro'
      toast.error(message)
      console.error('Error creating member:', error)
    },
  })
}

/**
 * Hook para actualizar un miembro
 */
export const useUpdateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdate }) =>
      updateMember(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['church-stats'] })
      toast.success('Miembro actualizado exitosamente')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al actualizar miembro'
      toast.error(message)
      console.error('Error updating member:', error)
    },
  })
}

/**
 * Hook para eliminar un miembro
 */
export const useDeleteMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['church-stats'] })
      queryClient.invalidateQueries({ queryKey: ['members-at-risk'] })
      toast.success('Miembro eliminado exitosamente')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al eliminar miembro'
      toast.error(message)
      console.error('Error deleting member:', error)
    },
  })
}

/**
 * Hook para recalcular scores de un miembro
 */
export const useRecalculateMemberScores = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recalculateMemberScores(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['member', id] })
      queryClient.invalidateQueries({ queryKey: ['member-ai-insights', id] })
      queryClient.invalidateQueries({ queryKey: ['member-recommendations', id] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['church-stats'] })
      toast.success('Scores recalculados exitosamente')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al recalcular scores'
      toast.error(message)
    },
  })
}

/**
 * Hook para crear nota pastoral
 */
export const useCreatePastoralNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      createPastoralNote(memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-notes', variables.memberId] })
      toast.success('Nota pastoral guardada')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al guardar nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para registrar asistencia
 */
export const useRecordAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      recordAttendance(memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.memberId] })
      queryClient.invalidateQueries({ queryKey: ['member-attendance', variables.memberId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['church-stats'] })
      toast.success('Asistencia registrada')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al registrar asistencia'
      toast.error(message)
    },
  })
}

// ==================== UTILIDADES ====================

/**
 * Hook para refrescar todos los datos de miembros
 */
export const useRefreshMembersData = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['members'] })
    queryClient.invalidateQueries({ queryKey: ['church-stats'] })
    queryClient.invalidateQueries({ queryKey: ['members-at-risk'] })
    toast.success('Datos actualizados')
  }
}