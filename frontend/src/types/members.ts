// src/types/member.ts
// Tipos completos para el módulo de miembros

export interface Member {
  id: string
  church_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  member_type: 'activo' | 'visitante' | 'inactivo'
  member_status: 'active' | 'inactive'
  membership_date?: string
  baptism_date?: string
  ministries?: string[]
  spiritual_gifts?: string[]
  skills?: string[]
  small_group_id?: string
  small_group_role?: string
  preferred_contact_method?: string
  commitment_score?: number
  risk_level?: 'bajo' | 'medio' | 'alto' | 'critico'
  attendance_rate?: number
  last_attendance?: string
  created_at: string
  updated_at: string
}

export interface MemberCreate {
  church_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  member_type: 'activo' | 'visitante' | 'inactivo'
  ministries?: string[]
  spiritual_gifts?: string[]
  skills?: string[]
  preferred_contact_method?: string
}

export interface MemberUpdate extends Partial<MemberCreate> {}

export interface MemberStats {
  total_members: number
  active_members: number
  visitors: number
  inactive_members: number
  members_at_risk: number
  average_attendance_rate: number
  average_commitment_score: number
  ministries_coverage?: number
  small_groups_participation?: number
}

export interface RiskAnalysis {
  level: 'bajo' | 'medio' | 'alto' | 'critico'
  score: number
  factors: string[]
  recommendation: string
}

export interface MinistrySuggestion {
  ministry: string
  reason: string
  fit_score: number
}

export interface AIInsights {
  member_id: string
  commitment_score: number
  attendance_rate: number
  risk_analysis: RiskAnalysis
  insights: string
  ministry_suggestions: MinistrySuggestion[]
}

export interface RecommendedAction {
  action: string
  priority: 'alta' | 'media' | 'baja'
  channel: string
  reason: string
}

export interface Recommendation {
  member_id: string
  member_name: string
  risk_level: string
  risk_score: number
  risk_factors: string[]
  recommended_actions: RecommendedAction[]
  ai_recommendation: string
}

export interface PastoralNote {
  id: string
  member_id: string
  pastor_id: string
  note_type: string
  title: string
  content: string
  is_private: boolean
  follow_up_date?: string
  created_at: string
}

export interface AttendanceRecord {
  id: string
  member_id: string
  church_id: string
  service_date: string
  service_type: string
  attended: boolean
  notes?: string
  created_at: string
}