// src/api/members.ts
// Servicios API para gestión de miembros

import api from '../services/api'
import {
  Member,
  MemberCreate,
  MemberUpdate,
  MemberStats,
  AIInsights,
  Recommendation,
  PastoralNote,
  AttendanceRecord
} from '../types/members'

// ==================== CRUD MIEMBROS ====================

/**
 * Obtener todos los miembros con filtros opcionales
 */
export const getMembers = async (params?: {
  member_type?: string
  member_status?: string
  risk_level?: string
  search?: string
  skip?: number
  limit?: number
}): Promise<Member[]> => {
  const { data } = await api.get('/v1/members/', { params })
  return data
}

/**
 * Obtener un miembro por ID
 */
export const getMemberById = async (id: string): Promise<Member> => {
  const { data } = await api.get(`/v1/members/${id}`)
  return data
}

/**
 * Crear un nuevo miembro
 */
export const createMember = async (memberData: MemberCreate): Promise<Member> => {
  const { data } = await api.post('/v1/members/', memberData)
  return data
}

/**
 * Actualizar un miembro existente
 */
export const updateMember = async (
  id: string,
  memberData: MemberUpdate
): Promise<Member> => {
  const { data } = await api.put(`/v1/members/${id}`, memberData)
  return data
}

/**
 * Eliminar (desactivar) un miembro
 */
export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/v1/members/${id}`)
}

// ==================== ESTADÍSTICAS ====================

/**
 * Obtener estadísticas generales de la iglesia
 */
export const getChurchStats = async (): Promise<MemberStats> => {
  const { data } = await api.get('/v1/members/stats')
  return data
}

/**
 * Obtener lista de miembros en riesgo
 */
export const getMembersAtRisk = async (): Promise<Member[]> => {
  const { data } = await api.get('/v1/members/at-risk')
  return data
}

// ==================== IA Y ANÁLISIS ====================

/**
 * Obtener AI insights de un miembro
 * Incluye: commitment score, risk analysis, insights textuales, sugerencias de ministerios
 */
export const getMemberAIInsights = async (id: string): Promise<AIInsights> => {
  const { data } = await api.get(`/v1/members/${id}/ai-insights`)
  return data
}

/**
 * Obtener recomendaciones de seguimiento para un miembro
 */
export const getMemberRecommendations = async (id: string): Promise<Recommendation> => {
  const { data } = await api.get(`/v1/members/${id}/recommendations`)
  return data
}

/**
 * Recalcular todos los scores y análisis de IA de un miembro
 */
export const recalculateMemberScores = async (id: string): Promise<Member> => {
  const { data } = await api.post(`/v1/members/${id}/recalculate`)
  return data
}

// ==================== NOTAS PASTORALES ====================

/**
 * Crear una nota pastoral
 */
export const createPastoralNote = async (
  memberId: string,
  noteData: Omit<PastoralNote, 'id' | 'created_at' | 'member_id' | 'pastor_id'>
): Promise<PastoralNote> => {
  const { data } = await api.post(`/v1/members/${memberId}/notes`, noteData)
  return data
}

/**
 * Obtener todas las notas de un miembro
 */
export const getMemberNotes = async (
  memberId: string,
  includePrivate: boolean = true
): Promise<PastoralNote[]> => {
  const { data } = await api.get(`/v1/members/${memberId}/notes`, {
    params: { include_private: includePrivate }
  })
  return data
}

// ==================== ASISTENCIA ====================

/**
 * Registrar asistencia de un miembro
 */
export const recordAttendance = async (
  memberId: string,
  attendanceData: Omit<AttendanceRecord, 'id' | 'created_at' | 'member_id'>
): Promise<AttendanceRecord> => {
  const { data } = await api.post(`/v1/members/${memberId}/attendance`, attendanceData)
  return data
}

/**
 * Obtener historial de asistencia de un miembro
 */
export const getMemberAttendance = async (
  memberId: string,
  limit: number = 50
): Promise<AttendanceRecord[]> => {
  const { data } = await api.get(`/v1/members/${memberId}/attendance`, {
    params: { limit }
  })
  return data
}

// ==================== UTILIDADES ====================

/**
 * Buscar miembros por texto
 */
export const searchMembers = async (searchText: string): Promise<Member[]> => {
  return getMembers({ search: searchText, limit: 20 })
}

/**
 * Obtener miembros activos
 */
export const getActiveMembers = async (): Promise<Member[]> => {
  return getMembers({ member_status: 'active', member_type: 'activo' })
}

/**
 * Obtener visitantes
 */
export const getVisitors = async (): Promise<Member[]> => {
  return getMembers({ member_type: 'visitante', member_status: 'active' })
}