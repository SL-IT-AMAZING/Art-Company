'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDeleting?: boolean
}

/**
 * Reusable confirmation modal for delete operations
 * Shows warning and requires explicit confirmation
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDeleting = false
}: DeleteConfirmModalProps) {
  const t = useTranslations('deleteModal')
  const effectiveConfirmText = confirmText || t('delete')
  const effectiveCancelText = cancelText || t('cancel')
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

            {/* Message */}
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">{message}</p>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isDeleting}
              >
                {effectiveCancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? t('deleting') : effectiveConfirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
