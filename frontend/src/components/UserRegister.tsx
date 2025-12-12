import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import {
  User,
  Mail,
  Lock,
  Phone,
  Church,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'

type RegistrationType = 'pastor_new_church' | 'staff_existing_church' | 'member'

interface UserRegisterForm {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  phone?: string
  registration_type: RegistrationType
  
  // Para pastores
  pastor_info?: {
    denomination?: string
    years_in_ministry?: number
    current_church_name?: string
    ordination_certificate_url?: string
    reference_letter_url?: string
  }
  
  // Para staff
  church_invitation_code?: string
  requested_role?: string
}

const UserRegister: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  
  const [step, setStep] = useState(1)
  const [registrationType, setRegistrationType] = useState<RegistrationType>('pastor_new_church')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserRegisterForm>({
    defaultValues: {
      registration_type: 'pastor_new_church'
    }
  })

  const password = watch('password')

  const onSubmit = async (data: UserRegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validar confirmación de contraseña
      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Preparar datos según tipo de registro
      const requestData: any = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        registration_type: registrationType
      }

      // Agregar información específica según tipo
      if (registrationType === 'pastor_new_church' && data.pastor_info) {
        requestData.pastor_info = data.pastor_info
      }

      if (registrationType === 'staff_existing_church') {
        requestData.church_invitation_code = data.church_invitation_code
        requestData.requested_role = data.requested_role
      }

      const response = await registerUser(requestData)
      
      setResult(response)
      setSuccess(true)

      // Si fue auto-aprobado, redirigir al dashboard después de 2 segundos
      if (response.can_create_church) {
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }

    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return <SuccessScreen result={result} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6 text-blue-300 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver al inicio
          </Link>
          
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-white/20 backdrop-blur-lg p-4 rounded-2xl border border-white/30">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-blue-200 text-lg">Únete a la revolución de gestión eclesiástica con IA</p>
        </div>

        {/* Registration Type Selection (Step 1) */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              ¿Cómo deseas registrarte?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pastor - Nueva Iglesia */}
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('pastor_new_church')
                  setStep(2)
                }}
                className={`group bg-white/10 border-2 ${
                  registrationType === 'pastor_new_church' 
                    ? 'border-blue-500' 
                    : 'border-white/20'
                } rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-left`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Church className="h-10 w-10 text-blue-400" />
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Soy Pastor
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  Quiero registrar mi iglesia y usar ChurchAI
                </p>
                <div className="flex items-center text-blue-300 text-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Con evaluación IA
                </div>
              </button>

              {/* Staff - Iglesia Existente */}
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('staff_existing_church')
                  setStep(2)
                }}
                className={`group bg-white/10 border-2 ${
                  registrationType === 'staff_existing_church' 
                    ? 'border-blue-500' 
                    : 'border-white/20'
                } rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-left`}
              >
                <div className="flex items-center justify-between mb-4">
                  <User className="h-10 w-10 text-purple-400" />
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Soy Staff/Voluntario
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  Me invitaron a unirme a una iglesia existente
                </p>
                <div className="flex items-center text-blue-300 text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Necesitas código de invitación
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-300 hover:text-white transition-colors text-sm">
                ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
              </Link>
            </div>
          </div>
        )}

        {/* Registration Form (Step 2) */}
        {step === 2 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center text-blue-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Cambiar tipo de registro
            </button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Información Personal */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Información Personal</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Nombre <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('first_name', { required: 'El nombre es requerido' })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Juan"
                    />
                    {errors.first_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Apellido <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('last_name', { required: 'El apellido es requerido' })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pérez"
                    />
                    {errors.last_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Seguridad</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Contraseña <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', { 
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 8,
                            message: 'Mínimo 8 caracteres'
                          }
                        })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Confirmar Contraseña <span className="text-red-400">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('confirmPassword', { 
                        required: 'Confirma tu contraseña',
                        validate: value => value === password || 'Las contraseñas no coinciden'
                      })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Repite tu contraseña"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional según tipo */}
              {registrationType === 'pastor_new_church' && (
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                    Información Pastoral (Opcional)
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Aumenta tus posibilidades de aprobación automática
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Denominación
                      </label>
                      <input
                        {...register('pastor_info.denomination')}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Evangélica, Pentecostal, Bautista..."
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Años en el ministerio
                      </label>
                      <input
                        type="number"
                        {...register('pastor_info.years_in_ministry')}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 10"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Iglesia actual
                      </label>
                      <input
                        {...register('pastor_info.current_church_name')}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de tu iglesia actual"
                      />
                    </div>
                  </div>
                </div>
              )}

              {registrationType === 'staff_existing_church' && (
                <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Información de Invitación
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Código de Invitación <span className="text-red-400">*</span>
                      </label>
                      <input
                        {...register('church_invitation_code', { 
                          required: 'El código de invitación es requerido' 
                        })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder="Ej: ABC12XYZ"
                      />
                      {errors.church_invitation_code && (
                        <p className="text-red-400 text-sm mt-1">{errors.church_invitation_code.message}</p>
                      )}
                      <p className="text-blue-200 text-sm mt-2">
                        Solicita este código al pastor de tu iglesia
                      </p>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Rol solicitado
                      </label>
                      <select
                        {...register('requested_role')}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="voluntario" className="bg-slate-800">Voluntario</option>
                        <option value="lider_ministerio" className="bg-slate-800">Líder de Ministerio</option>
                        <option value="secretario" className="bg-slate-800">Secretario</option>
                        <option value="tesorero" className="bg-slate-800">Tesorero</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Crear Cuenta
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-center text-blue-200 text-sm">
                Al registrarte, aceptas nuestros{' '}
                <Link to="/terms" className="text-blue-400 hover:text-white">
                  Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-white">
                  Política de Privacidad
                </Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// Success Screen Component
interface SuccessScreenProps {
  result: any
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ result }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Cuenta Creada Exitosamente!
          </h1>

          {result.can_create_church ? (
            <>
              <p className="text-xl text-green-300 mb-6">
                ✅ Tu solicitud fue aprobada automáticamente por nuestra IA
              </p>
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 mb-8">
                <p className="text-white mb-4">
                  <strong>¡Excelente!</strong> Ahora puedes registrar tu iglesia y comenzar a usar ChurchAI.
                </p>
                <p className="text-green-200 text-sm">
                  Score de IA: {((result.ai_score || 0) * 100).toFixed(0)}%
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Registrar Mi Iglesia
              </button>
            </>
          ) : (
            <>
              <p className="text-xl text-yellow-300 mb-6">
                ⏳ Tu solicitud está en proceso de revisión
              </p>
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6 mb-8">
                <p className="text-white mb-2">
                  {result.message || 'Tu cuenta ha sido creada, pero requiere aprobación manual.'}
                </p>
                <p className="text-yellow-200 text-sm">
                  Tiempo estimado: {result.estimated_approval_time || '24-48 horas'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Ir al Dashboard
              </button>
            </>
          )}

          <div className="mt-8">
            <Link to="/" className="text-blue-300 hover:text-white transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRegister
