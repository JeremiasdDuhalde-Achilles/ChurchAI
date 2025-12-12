// src/components/members/ConfirmDeleteModal.tsx
import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  memberName: string
  isDeleting?: boolean
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isDeleting = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="text-center py-4">
        {/* Icon de advertencia */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-white mb-3">
          ¿Eliminar Miembro?
        </h3>

        {/* Mensaje */}
        <p className="text-blue-200 mb-2">
          Estás a punto de eliminar a:
        </p>
        <p className="text-xl font-semibold text-white mb-4">
          {memberName}
        </p>

        {/* Advertencia */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-300 text-sm">
            ⚠️ Esta acción no se puede deshacer. El miembro será marcado como inactivo
            pero su historial se mantendrá en el sistema.
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="secondary"
            icon={<X className="h-5 w-5" />}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="h-5 w-5" />}
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Sí, Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  )
}