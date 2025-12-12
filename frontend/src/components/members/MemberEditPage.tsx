// src/components/members/MemberEditPage.tsx
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useMember, useUpdateMember } from '../../hooks/useMembers'
import { toast } from 'sonner'

// Schema de validación
const memberSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
  member_type: z.enum(['activo', 'visitante', 'inactivo']),
  ministries: z.array(z.string()).optional(),
  spiritual_gifts: z.array(z.string()).optional(),
  preferred_contact_method: z.string().optional(),
  membership_date: z.string().optional(),
  baptism_date: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

export const MemberEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: member, isLoading: loadingMember } = useMember(id)
  const updateMember = useUpdateMember()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema)
  })

  // Prellenar formulario cuando carguen los datos
  useEffect(() => {
    if (member) {
      reset({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || '',
        phone: member.phone || '',
        birth_date: member.birth_date || '',
        gender: member.gender || '',
        marital_status: member.marital_status || '',
        member_type: member.member_type,
        ministries: member.ministries || [],
        spiritual_gifts: member.spiritual_gifts || [],
        preferred_contact_method: member.preferred_contact_method || '',
        membership_date: member.membership_date || '',
        baptism_date: member.baptism_date || '',
      })
    }
  }, [member, reset])

  const onSubmit = async (data: MemberFormData) => {
    if (!id) return

    try {
      await updateMember.mutateAsync({ id, data })
      navigate(`/members/${id}`)
    } catch (error) {
      // Error ya manejado por el hook
    }
  }

  const handleCancel = () => {
    navigate(`/members/${id}`)
  }

  if (loadingMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <Card>
          <LoadingSpinner text="Cargando información del miembro..." size="lg" />
        </Card>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Miembro no encontrado</h2>
            <Button onClick={() => navigate('/members')}>Volver a la lista</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(`/members/${id}`)}
            >
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Editar Miembro
              </h1>
              <p className="text-blue-200">
                {member.first_name} {member.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <h3 className="text-xl font-bold text-white mb-6">Información Personal</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan"
                />
                {errors.first_name && (
                  <p className="mt-1 text-red-400 text-sm">{errors.first_name.message}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Apellido <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pérez"
                />
                {errors.last_name && (
                  <p className="mt-1 text-red-400 text-sm">{errors.last_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  {...register('birth_date')}
                  type="date"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Género
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Estado Civil
                </label>
                <select
                  {...register('marital_status')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="soltero">Soltero/a</option>
                  <option value="casado">Casado/a</option>
                  <option value="divorciado">Divorciado/a</option>
                  <option value="viudo">Viudo/a</option>
                </select>
              </div>

              {/* Tipo de Miembro */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Tipo de Miembro <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('member_type')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="visitante">Visitante</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Información de Iglesia */}
          <Card className="mb-6">
            <h3 className="text-xl font-bold text-white mb-6">Información de Iglesia</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fecha de Membresía */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Fecha de Membresía
                </label>
                <input
                  {...register('membership_date')}
                  type="date"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha de Bautismo */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Fecha de Bautismo
                </label>
                <input
                  {...register('baptism_date')}
                  type="date"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Método de Contacto Preferido */}
              <div className="md:col-span-2">
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Método de Contacto Preferido
                </label>
                <select
                  {...register('preferred_contact_method')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="email">Email</option>
                  <option value="phone">Teléfono</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="in_person">En persona</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              icon={<X className="h-5 w-5" />}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="h-5 w-5" />}
              isLoading={isSubmitting}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}