// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Combina clases CSS usando clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Formatea una fecha a string legible en español
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Formatea una fecha de forma relativa ("hace 2 días")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Formatea un número con separador de miles
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}

/**
 * Obtiene el color apropiado según el nivel de riesgo
 */
export function getRiskColor(level: string): string {
  const colors = {
    bajo: 'text-green-400 bg-green-500/20 border-green-400/30',
    medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30',
    alto: 'text-orange-400 bg-orange-500/20 border-orange-400/30',
    critico: 'text-red-400 bg-red-500/20 border-red-400/30'
  }
  return colors[level as keyof typeof colors] || colors.bajo
}

/**
 * Obtiene el color según el score de compromiso
 */
export function getCommitmentColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Obtiene la variante de Badge según el nivel de riesgo
 */
export function getRiskBadgeVariant(
  level: string
): 'success' | 'warning' | 'danger' | 'info' {
  const variants = {
    bajo: 'success' as const,
    medio: 'warning' as const,
    alto: 'danger' as const,
    critico: 'danger' as const
  }
  return variants[level as keyof typeof variants] || 'info'
}

/**
 * Obtiene la variante de Badge según el tipo de miembro
 */
export function getMemberTypeBadgeVariant(
  type: string
): 'success' | 'info' | 'default' {
  const variants = {
    activo: 'success' as const,
    visitante: 'info' as const,
    inactivo: 'default' as const
  }
  return variants[type as keyof typeof variants] || 'default'
}

/**
 * Trunca un texto a un número máximo de caracteres
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convierte un string a formato de título (Title Case)
 */
export function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un teléfono es válido (formato argentino)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+54|0)?[\s-]?(\d{2,4})[\s-]?(\d{6,8})$/
  return phoneRegex.test(phone)
}

/**
 * Genera iniciales a partir de un nombre completo
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date()
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Genera un color aleatorio en formato hex
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Descarga un archivo blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Debounce function para optimizar búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Formatea un array de strings como lista
 */
export function formatList(items: string[], max: number = 3): string {
  if (items.length === 0) return 'Ninguno'
  if (items.length <= max) return items.join(', ')
  return `${items.slice(0, max).join(', ')} +${items.length - max} más`
}

/**
 * Genera un color de fondo basado en un string (para avatares)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}