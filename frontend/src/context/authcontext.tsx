import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useAuth } from './AuthContext'
import { 
  Church, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Brain,
  Shield,
  Zap
} from 'lucide-react'
import axios from 'axios'

interface ChurchForm {
  name: string
  denomination: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  contact_info: {
    primary_email: string
    primary_phone: string
  }
  legal_documentation: {
    documents: Array<{
      document_type: string
      document_number: string
      issued_date: string
      issuing_authority: string
    }>
    legal_representative_name: string
    legal_representative_id: string
    legal_representative_position: string
    registration_authority: string
    registration_number: string
    registration_date: string
  }
  organizational_structure: string
  estimated_size: string
  founding_date: string
  website_url?: string
}

const registerChurch = async (data: ChurchForm) => {
  console.log('📤 Enviando datos al backend:', data)
  
  try {
    const response = await axios.post('/api/v1/churches/register', data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos timeout
    })
    
    console.log('✅ Respuesta exitosa del backend:', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ Error en el registro:', error)
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Error de conexión con el servidor'
      
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage
      })
      
      throw new Error(errorMessage)
    }
    
    throw new Error('Error inesperado durante el registro')
  }
}

const ChurchRegistration: React.FC = () => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Verificar si el usuario puede crear iglesia
  if (user && !user.can_create_church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Aprobación Pendiente
          </h1>
          <p className="text-blue-200 mb-6">
            Tu cuenta está en proceso de revisión. Una vez aprobada, podrás registrar tu iglesia.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (user && user.has_church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Ya tienes una iglesia registrada
          </h1>
          <p className="text-blue-200 mb-6">
            Ya cuentas con una iglesia registrada en el sistema.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    )
  }

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ChurchForm>({
    defaultValues: {
      organizational_structure: 'traditional',
      estimated_size: 'medium',
      address: { country: 'Argentina' },
      legal_documentation: {
        documents: [{
          document_type: 'legal_entity',
          issued_date: new Date().toISOString().split('T')[0],
          document_number: '',
          issuing_authority: ''
        }],
        legal_representative_position: 'Pastor Principal',
        registration_date: new Date().toISOString().split('T')[0],
        // Valores por defecto para evitar errores
        registration_authority: 'IGJ - Buenos Aires',
        registration_number: 'REG-' + Date.now(),
        legal_representative_name: '',
        legal_representative_id: ''
      }
    }
  })

  const mutation = useMutation(registerChurch, {
    onSuccess: (data) => {
      console.log('🎉 Registro exitoso:', data)
      setIsSuccess(true)
      setResult(data.data || data)
    },
    onError: (error: any) => {
      console.error('💥 Error en mutation:', error)
      // No hacer nada aquí, el error se muestra en el UI automáticamente
    }
  })

  const onSubmit = (data: ChurchForm) => {
    console.log('📝 Datos del formulario antes del envío:', data)
    
    try {
      // Formatear fechas para asegurar formato ISO correcto
      const formattedData = {
        ...data,
        founding_date: new Date(data.founding_date).toISOString(),
        legal_documentation: {
          ...data.legal_documentation,
          registration_date: new Date(data.legal_documentation.registration_date).toISOString(),
          documents: data.legal_documentation.documents.map(doc => ({
            ...doc,
            issued_date: new Date(doc.issued_date).toISOString()
          }))
        }
      }
      
      console.log('📤 Datos formateados para envío:', formattedData)
      mutation.mutate(formattedData)
      
    } catch (error) {
      console.error('💥 Error al formatear datos:', error)
      alert('Error al formatear los datos. Verifica las fechas.')
    }
  }

  // Debug panel
  const toggleDebug = () => setDebugMode(!debugMode)

  if (isSuccess) {
    return <SuccessScreen result={result} />
  }

  const steps = [
    { 
      number: 1, 
      title: 'Información Básica', 
      icon: <Church className="h-6 w-6" />,
      description: 'Datos principales de tu iglesia'
    },
    { 
      number: 2, 
      title: 'Ubicación & Contacto', 
      icon: <MapPin className="h-6 w-6" />,
      description: 'Dónde encontrarte'
    },
    { 
      number: 3, 
      title: 'Documentación Legal', 
      icon: <FileText className="h-6 w-6" />,
      description: 'Validación oficial'
    },
    { 
      number: 4, 
      title: 'Configuración IA', 
      icon: <Brain className="h-6 w-6" />,
      description: 'Personalización inteligente'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg z-50 max-w-md">
          <h4 className="font-bold mb-2">🐛 Debug Info</h4>
          <div className="text-xs space-y-1">
            <div>Step: {currentStep}/4</div>
            <div>Mutation Status: {mutation.status}</div>
            <div>Error: {mutation.error ? String(mutation.error) : 'None'}</div>
            <div>Loading: {mutation.isLoading ? 'Yes' : 'No'}</div>
          </div>
          <button 
            onClick={toggleDebug}
            className="mt-2 text-xs bg-red-600 px-2 py-1 rounded"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Debug Toggle Button */}
      <button
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-40"
        title="Toggle Debug"
      >
        🐛
      </button>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-full px-6 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Registro Inteligente con IA</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Registra tu <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Iglesia</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Nuestro sistema de IA validará automáticamente tu información y te dará acceso inmediato
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-white/20 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {steps.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white shadow-lg' 
                      : 'border-white/30 text-white/50 bg-white/10 backdrop-blur-lg'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-white' : 'text-white/50'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
                        <Church className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Información Básica</h2>
                      <p className="text-blue-100">Cuéntanos sobre tu iglesia</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Nombre de la Iglesia"
                        error={errors.name?.message}
                        required
                        icon={<Church className="h-5 w-5" />}
                      >
                        <input
                          {...register('name', { required: 'Nombre es requerido' })}
                          className="premium-input"
                          placeholder="Ej: Iglesia Cristiana Nueva Vida"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Denominación"
                        error={errors.denomination?.message}
                        required
                        icon={<Users className="h-5 w-5" />}
                      >
                        <input
                          {...register('denomination', { required: 'Denominación es requerida' })}
                          className="premium-input"
                          placeholder="Ej: Evangélica Pentecostal"
                        />
                      </PremiumFormField>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Estructura Organizacional"
                        required
                        icon={<Users className="h-5 w-5" />}
                      >
                        <select {...register('organizational_structure')} className="premium-input">
                          <option value="traditional">Tradicional</option>
                          <option value="cells">Células/Casas de Paz</option>
                          <option value="g12">G12</option>
                          <option value="network">Red de Iglesias</option>
                          <option value="ministries">Por Ministerios</option>
                        </select>
                      </PremiumFormField>

                      <PremiumFormField
                        label="Tamaño Estimado"
                        required
                        icon={<Users className="h-5 w-5" />}
                      >
                        <select {...register('estimated_size')} className="premium-input">
                          <option value="small">Pequeña (1-50 miembros)</option>
                          <option value="medium">Mediana (51-200 miembros)</option>
                          <option value="large">Grande (201-500 miembros)</option>
                          <option value="mega">Mega (500+ miembros)</option>
                        </select>
                      </PremiumFormField>
                    </div>

                    <PremiumFormField
                      label="Fecha de Fundación"
                      error={errors.founding_date?.message}
                      required
                      icon={<Calendar className="h-5 w-5" />}
                    >
                      <input
                        {...register('founding_date', { required: 'Fecha es requerida' })}
                        type="date"
                        className="premium-input"
                      />
                    </PremiumFormField>

                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-6 w-6 text-blue-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">IA Análisis en Tiempo Real</h4>
                          <p className="text-blue-100 text-sm">
                            Nuestro sistema está analizando la información para personalizar tu experiencia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Contact */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Ubicación & Contacto</h2>
                      <p className="text-blue-100">¿Dónde podemos encontrarte?</p>
                    </div>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Email Principal"
                        error={errors.contact_info?.primary_email?.message}
                        required
                        icon={<Mail className="h-5 w-5" />}
                      >
                        <input
                          {...register('contact_info.primary_email', { 
                            required: 'Email es requerido',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido'
                            }
                          })}
                          type="email"
                          className="premium-input"
                          placeholder="pastor@iglesia.com"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Teléfono Principal"
                        error={errors.contact_info?.primary_phone?.message}
                        required
                        icon={<Phone className="h-5 w-5" />}
                      >
                        <input
                          {...register('contact_info.primary_phone', { 
                            required: 'Teléfono es requerido',
                            minLength: {
                              value: 10,
                              message: 'Teléfono debe tener al menos 10 dígitos'
                            }
                          })}
                          className="premium-input"
                          placeholder="+54 11 1234-5678"
                        />
                      </PremiumFormField>
                    </div>

                    {/* Address */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <PremiumFormField
                        label="Calle"
                        error={errors.address?.street?.message}
                        required
                      >
                        <input
                          {...register('address.street', { required: 'Calle es requerida' })}
                          className="premium-input"
                          placeholder="Av. Corrientes"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Número"
                        error={errors.address?.number?.message}
                        required
                      >
                        <input
                          {...register('address.number', { required: 'Número es requerido' })}
                          className="premium-input"
                          placeholder="1234"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Barrio"
                        error={errors.address?.neighborhood?.message}
                        required
                      >
                        <input
                          {...register('address.neighborhood', { required: 'Barrio es requerido' })}
                          className="premium-input"
                          placeholder="San Telmo"
                        />
                      </PremiumFormField>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <PremiumFormField
                        label="Ciudad"
                        error={errors.address?.city?.message}
                        required
                      >
                        <input
                          {...register('address.city', { required: 'Ciudad es requerida' })}
                          className="premium-input"
                          placeholder="Buenos Aires"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Provincia/Estado"
                        error={errors.address?.state?.message}
                        required
                      >
                        <input
                          {...register('address.state', { required: 'Provincia es requerida' })}
                          className="premium-input"
                          placeholder="Buenos Aires"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Código Postal"
                        error={errors.address?.postal_code?.message}
                        required
                      >
                        <input
                          {...register('address.postal_code', { required: 'Código postal es requerido' })}
                          className="premium-input"
                          placeholder="C1043"
                        />
                      </PremiumFormField>
                    </div>
                  </div>
                )}

                {/* Step 3: Legal Documentation */}
                {currentStep === 3 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Documentación Legal</h2>
                      <p className="text-blue-100">Información legal de tu organización</p>
                    </div>

                    <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 mb-8">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-green-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">✅ Documentación Simplificada</h4>
                          <p className="text-green-100 text-sm">
                            Puedes usar valores aproximados o genéricos. El sistema se adapta automáticamente.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Representante Legal"
                        required
                      >
                        <input
                          {...register('legal_documentation.legal_representative_name', { required: 'Representante es requerido' })}
                          className="premium-input"
                          placeholder="Pastor Juan Carlos Martínez"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Documento del Representante"
                        required
                      >
                        <input
                          {...register('legal_documentation.legal_representative_id', { required: 'Documento es requerido' })}
                          className="premium-input"
                          placeholder="12345678"
                        />
                      </PremiumFormField>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Autoridad de Registro"
                        required
                        helpText="Ej: IGJ, Registro Civil, etc."
                      >
                        <input
                          {...register('legal_documentation.registration_authority', { required: 'Autoridad es requerida' })}
                          className="premium-input"
                          placeholder="IGJ - Buenos Aires"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Número de Registro"
                        required
                        helpText="Cualquier número de registro oficial"
                      >
                        <input
                          {...register('legal_documentation.registration_number', { required: 'Número es requerido' })}
                          className="premium-input"
                          placeholder="IGJ-001234-2023"
                        />
                      </PremiumFormField>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PremiumFormField
                        label="Número de Documento Legal"
                        required
                        helpText="Personería jurídica u otro documento"
                      >
                        <input
                          {...register('legal_documentation.documents.0.document_number', { required: 'Número de documento es requerido' })}
                          className="premium-input"
                          placeholder="IGR-2023-001234"
                        />
                      </PremiumFormField>

                      <PremiumFormField
                        label="Autoridad Emisora"
                        required
                        helpText="Quien emitió el documento"
                      >
                        <input
                          {...register('legal_documentation.documents.0.issuing_authority', { required: 'Autoridad emisora es requerida' })}
                          className="premium-input"
                          placeholder="Registro Nacional de Cultos"
                        />
                      </PremiumFormField>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-6 w-6 text-blue-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">💡 Tip de IA</h4>
                          <p className="text-blue-100 text-sm">
                            No te preocupes por los valores exactos. Nuestro sistema de IA se enfoca en la legitimidad general de tu iglesia, no en detalles burocráticos específicos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: IA Configuration */}
                {currentStep === 4 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-4">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Configuración IA</h2>
                      <p className="text-blue-100">Personalización final del sistema inteligente</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-8">
                      <div className="text-center">
                        <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-4">IA Lista para Activar</h3>
                        <p className="text-blue-100 mb-6">
                          El sistema ha analizado tu información y está listo para personalizar 
                          la experiencia de tu iglesia
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-white/10 rounded-lg p-4">
                            <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-white font-medium">Pastor IA</div>
                            <div className="text-blue-200">Activado</div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4">
                            <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
                            <div className="text-white font-medium">CRM Inteligente</div>
                            <div className="text-blue-200">Configurado</div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4">
                            <Shield className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-white font-medium">Validación IA</div>
                            <div className="text-blue-200">En proceso</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <PremiumFormField
                      label="Sitio Web (Opcional)"
                      icon={<Users className="h-5 w-5" />}
                      helpText="Si tienes página web, agrégala aquí"
                    >
                      <input
                        {...register('website_url')}
                        type="url"
                        className="premium-input"
                        placeholder="https://miglesia.com"
                      />
                    </PremiumFormField>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center px-6 py-3 text-white/80 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-lg border border-white/20"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                    >
                      Siguiente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={mutation.isLoading}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                    >
                      {mutation.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando con IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Activar ChurchAI
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Error Display Mejorado */}
                {mutation.isError && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-red-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">Error en el Registro</h4>
                        <p className="text-red-100 text-sm mb-3">
                          {mutation.error?.message || 'Hubo un error al registrar la iglesia. Por favor, intenta nuevamente.'}
                        </p>
                        
                        {debugMode && (
                          <details className="mt-4">
                            <summary className="text-red-200 text-xs cursor-pointer">
                              Ver detalles técnicos
                            </summary>
                            <pre className="mt-2 text-xs text-red-200 bg-red-900/20 p-2 rounded overflow-auto">
                              {JSON.stringify(mutation.error, null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => mutation.reset()}
                            className="text-xs bg-red-600/50 hover:bg-red-600/70 px-3 py-1 rounded transition-colors"
                          >
                            Reintentar
                          </button>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-xs bg-blue-600/50 hover:bg-blue-600/70 px-3 py-1 rounded transition-colors"
                          >
                            Volver al inicio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Premium Form Field Component Mejorado
interface PremiumFormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
  helpText?: string
}

const PremiumFormField: React.FC<PremiumFormFieldProps> = ({ 
  label, error, required, children, icon, helpText 
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-white font-medium">
        {icon && <span className="mr-2 text-blue-400">{icon}</span>}
        {label} 
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {helpText && (
        <p className="text-blue-200 text-sm">{helpText}</p>
      )}
      {children}
      {error && (
        <p className="text-red-400 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  )
}

// Success Screen Component Mejorado
interface SuccessScreenProps {
  result: any
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ result }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
          {/* Success Animation */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-8 animate-bounce">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Registro <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Exitoso</span>!
          </h1>
          
          <p className="text-xl text-blue-100 mb-8">
            Tu iglesia ha sido registrada y validada por nuestro sistema de IA
          </p>

          {/* Result Info */}
          <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-400/30 rounded-xl p-6 mb-8">
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-blue-200">ID de Iglesia:</span>
                <span className="text-white font-mono text-sm">{result?.church_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result?.status === 'validated' 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                }`}>
                  {result?.status === 'validated' ? '✅ Validado por IA' : '⏳ En Revisión'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Validación:</span>
                <span className="text-white">{result?.estimated_validation_time}</span>
              </div>
              {result?.ai_risk_score && (
                <div className="flex justify-between">
                  <span className="text-blue-200">Score IA:</span>
                  <span className="text-green-300">{(result.ai_risk_score * 100).toFixed(1)}% confianza</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Próximos Pasos:</h3>
            <div className="space-y-3">
              {result?.next_steps?.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-blue-100">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              Acceder al Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 border-2 border-white/30 text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-lg font-semibold"
            >
              Registrar Otra Iglesia
            </button>
          </div>

          {/* Debug Info */}
          <details className="mt-8 text-left">
            <summary className="text-blue-200 text-sm cursor-pointer hover:text-white">
              Ver información técnica
            </summary>
            <pre className="mt-4 text-xs text-blue-200 bg-blue-900/20 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}

export default ChurchRegistration