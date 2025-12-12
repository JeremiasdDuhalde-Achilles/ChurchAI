// src/components/members/ImportMembersPage.tsx
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { toast } from 'sonner'
import api from '../../services/api'

interface ImportResult {
  total_rows: number
  imported: number
  failed: number
  errors: Array<{
    row: number
    name: string
    error: string
  }>
  success: boolean
}

export const ImportMembersPage: React.FC = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post<ImportResult>('/members/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      
      if (response.data.success) {
        toast.success(
          `¡Importación exitosa! ${response.data.imported} miembros importados.`,
          { duration: 5000 }
        )
      } else {
        toast.error('La importación tuvo errores. Revisa el reporte abajo.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al importar archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/members/import/template', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'plantilla_importacion_miembros.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Plantilla descargada')
    } catch (error) {
      toast.error('Error al descargar plantilla')
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-5xl">
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
                Importar Miembros
              </h1>
              <p className="text-blue-200">
                Sube un archivo Excel o CSV con la información de tus miembros
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <Card className="mb-6" variant="gradient">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileSpreadsheet className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">
                Instrucciones de Importación
              </h3>
              
              <ol className="space-y-2 text-blue-100 mb-4">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Descarga la plantilla de Excel haciendo clic en el botón de abajo</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Completa la información de tus miembros en el archivo</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Guarda el archivo y súbelo aquí</span>
                </li>
              </ol>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-4">
                <p className="text-blue-200 text-sm font-semibold mb-2">
                  📋 Columnas requeridas:
                </p>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• <strong>first_name</strong> - Nombre (requerido)</li>
                  <li>• <strong>last_name</strong> - Apellido (requerido)</li>
                  <li>• <strong>email</strong> - Email</li>
                  <li>• <strong>phone</strong> - Teléfono</li>
                  <li>• <strong>member_type</strong> - Tipo: activo, visitante, inactivo</li>
                  <li>• Y más... (ver plantilla para lista completa)</li>
                </ul>
              </div>

              <Button
                variant="primary"
                icon={<Download className="h-5 w-5" />}
                onClick={handleDownloadTemplate}
              >
                Descargar Plantilla de Excel
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Zone */}
        {!result && (
          <Card className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Subir Archivo
            </h3>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-300
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
                }
              `}
            >
              <input {...getInputProps()} />
              
              <Upload className={`h-16 w-16 mx-auto mb-4 ${
                isDragActive ? 'text-blue-400' : 'text-blue-300'
              }`} />
              
              {isDragActive ? (
                <p className="text-blue-200 text-lg">
                  Suelta el archivo aquí...
                </p>
              ) : (
                <>
                  <p className="text-white text-lg font-semibold mb-2">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-blue-300 text-sm">
                    Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv)
                  </p>
                </>
              )}
            </div>

            {file && (
              <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">{file.name}</p>
                    <p className="text-blue-300 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                  >
                    Cambiar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Upload className="h-4 w-4" />}
                    onClick={handleUpload}
                    isLoading={uploading}
                  >
                    Importar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Uploading */}
        {uploading && (
          <Card>
            <LoadingSpinner 
              text="Procesando archivo e importando miembros..." 
              size="lg" 
            />
          </Card>
        )}

        {/* Resultados */}
        {result && !uploading && (
          <Card>
            <div className="text-center mb-6">
              {result.success ? (
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {result.success ? '¡Importación Completada!' : 'Importación con Errores'}
              </h3>
              
              <p className="text-blue-200">
                Se procesaron {result.total_rows} filas
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 font-semibold">Importados</span>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mt-2">
                  {result.imported}
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-red-300 font-semibold">Errores</span>
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="text-3xl font-bold text-red-400 mt-2">
                  {result.failed}
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-semibold">Total</span>
                  <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mt-2">
                  {result.total_rows}
                </div>
              </div>
            </div>

            {/* Errores */}
            {result.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h4 className="text-red-300 font-semibold">
                    Errores Encontrados ({result.errors.length})
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-200 bg-red-500/5 p-3 rounded-lg">
                      <span className="font-semibold">Fila {error.row}:</span> {error.name} - {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                Importar Otro Archivo
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/members')}
              >
                Ver Miembros
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}