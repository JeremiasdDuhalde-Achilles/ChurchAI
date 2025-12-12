// src/components/members/CreateMemberModal.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useCreateMember } from '../../hooks/useMembers'
import { useAuth } from '../../context/AuthContext'
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
})

type MemberFormData = z.infer<typeof memberSchema>

interface CreateMemberModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateMemberModal: React.FC<CreateMemberModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const createMember = useCreateMember()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      member_type: 'activo',
      ministries: [],
      spiritual_gifts: []
    }
  })

  const onSubmit = async (data: MemberFormData) => {
    if (!user?.church_id) {
      toast.error('No tienes una iglesia asignada')
      return
    }

    try {
      await createMember.mutateAsync({
        ...data,
        church_id: user.church_id
      })
      reset()
      onClose()
    } catch (error) {
      // Error ya manejado por el hook
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Nuevo Miembro"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Guardar Miembro
          </Button>
        </>
      }
    >
      <form className="space-y-6">
        {/* Información Personal */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
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
        </div>

        {/* Método de Contacto Preferido */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Preferencias</h3>
          
          <div>
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
      </form>
    </Modal>
  )
}