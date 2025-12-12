// src/api/churches.ts
// Servicios API para gestión de iglesias

import api from '../services/api'

export interface ChurchCreate {
  name: string
  denomination: string
  founding_date: string
  organizational_structure: string
  estimated_size: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postal_code: string
  }
  contact_info: {
    email: string
    phone: string
    website?: string
  }
  legal_documentation: {
    legal_representative_name: string
    registration_number?: string
    registration_authority?: string
  }
}

export interface Church {
  id: string
  name: string
  denomination: string
  founding_date: string
  organizational_structure: string
  estimated_size: string
  status: string
  is_validated: boolean
  validation_required: boolean
  owner_user_id: string
  invitation_code: string
  ai_risk_score: number
  ai_assessment: Record<string, any>
  address: Record<string, any>
  contact_info: Record<string, any>
  legal_documentation: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Registrar una nueva iglesia
 */
export const registerChurch = async (churchData: ChurchCreate): Promise<Church> => {
  const { data } = await api.post('/v1/churches/register', churchData)
  return data
}

/**
 * Obtener información de la iglesia del usuario actual
 */
export const getMyChurch = async (): Promise<Church> => {
  const { data } = await api.get('/v1/churches/me')
  return data
}

/**
 * Health check del servicio de iglesias
 */
export const getChurchesHealth = async () => {
  const { data } = await api.get('/v1/churches/health')
  return data
}

/**
 * Debug info del servicio de iglesias
 */
export const getChurchesDebug = async () => {
  const { data } = await api.get('/v1/churches/debug')
  return data
}
