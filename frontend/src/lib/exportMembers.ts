// src/lib/exportMembers.ts
import { Member } from '../types/members'

/**
 * Exportar miembros a CSV
 */
export const exportMembersToCSV = (members: Member[], filename: string = 'miembros.csv') => {
  // Definir headers
  const headers = [
    'ID',
    'Nombre',
    'Apellido',
    'Email',
    'Teléfono',
    'Fecha Nacimiento',
    'Género',
    'Estado Civil',
    'Tipo Miembro',
    'Score Compromiso',
    'Nivel Riesgo',
    'Tasa Asistencia',
    'Última Asistencia',
    'Fecha Membresía',
    'Fecha Bautismo',
    'Ministerios',
    'Dones Espirituales',
    'Método Contacto'
  ]

  // Convertir datos a filas CSV
  const rows = members.map(member => [
    member.id,
    member.first_name,
    member.last_name,
    member.email || '',
    member.phone || '',
    member.birth_date || '',
    member.gender || '',
    member.marital_status || '',
    member.member_type,
    member.commitment_score?.toFixed(2) || '',
    member.risk_level || '',
    member.attendance_rate?.toFixed(2) || '',
    member.last_attendance || '',
    member.membership_date || '',
    member.baptism_date || '',
    member.ministries?.join('; ') || '',
    member.spiritual_gifts?.join('; ') || '',
    member.preferred_contact_method || ''
  ])

  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escapar comillas y envolver en comillas si contiene coma
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  // Crear y descargar archivo
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exportar miembros a Excel usando una librería
 * Requiere: npm install xlsx
 */
export const exportMembersToExcel = async (members: Member[], filename: string = 'miembros.xlsx') => {
  // Importar dinámicamente xlsx
  const XLSX = await import('xlsx')

  // Preparar datos
  const data = members.map(member => ({
    'ID': member.id,
    'Nombre': member.first_name,
    'Apellido': member.last_name,
    'Email': member.email || '',
    'Teléfono': member.phone || '',
    'Fecha Nacimiento': member.birth_date || '',
    'Género': member.gender || '',
    'Estado Civil': member.marital_status || '',
    'Tipo Miembro': member.member_type,
    'Score Compromiso': member.commitment_score?.toFixed(2) || '',
    'Nivel Riesgo': member.risk_level || '',
    'Tasa Asistencia (%)': member.attendance_rate?.toFixed(2) || '',
    'Última Asistencia': member.last_attendance || '',
    'Fecha Membresía': member.membership_date || '',
    'Fecha Bautismo': member.baptism_date || '',
    'Ministerios': member.ministries?.join(', ') || '',
    'Dones Espirituales': member.spiritual_gifts?.join(', ') || '',
    'Método Contacto': member.preferred_contact_method || ''
  }))

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Miembros')

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 36 }, // ID
    { wch: 15 }, // Nombre
    { wch: 15 }, // Apellido
    { wch: 25 }, // Email
    { wch: 18 }, // Teléfono
    { wch: 15 }, // Fecha Nacimiento
    { wch: 12 }, // Género
    { wch: 15 }, // Estado Civil
    { wch: 15 }, // Tipo Miembro
    { wch: 15 }, // Score Compromiso
    { wch: 12 }, // Nivel Riesgo
    { wch: 15 }, // Tasa Asistencia
    { wch: 15 }, // Última Asistencia
    { wch: 15 }, // Fecha Membresía
    { wch: 15 }, // Fecha Bautismo
    { wch: 30 }, // Ministerios
    { wch: 30 }, // Dones
    { wch: 15 }  // Método Contacto
  ]
  worksheet['!cols'] = columnWidths

  // Descargar archivo
  XLSX.writeFile(workbook, filename)
}

/**
 * Exportar estadísticas a PDF (básico)
 */
export const exportStatsToPDF = (stats: any) => {
  // Esta es una implementación básica
  // Para producción, considera usar jsPDF o similar
  
  const content = `
REPORTE DE ESTADÍSTICAS
========================

Total de Miembros: ${stats.total_members}
Miembros Activos: ${stats.active_members}
Visitantes: ${stats.visitors}
En Riesgo: ${stats.at_risk}

Asistencia Promedio: ${stats.avg_attendance}%
Compromiso Promedio: ${stats.avg_commitment}

Generado: ${new Date().toLocaleDateString('es-AR')}
  `.trim()

  const blob = new Blob([content], { type: 'text/plain' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', 'estadisticas.txt')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}