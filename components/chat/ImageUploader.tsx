'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploaderProps {
  onUpload: (files: File[]) => void
  existingImages?: string[]
  maxImages?: number
}

export function ImageUploader({
  onUpload,
  existingImages = [],
  maxImages = 10,
}: ImageUploaderProps) {
  const t = useTranslations('imageUpload')
  const tCommon = useTranslations('common')
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError('')

      // Validate file count
      if (previews.length + acceptedFiles.length > maxImages) {
        setError(t('maxImages', { max: maxImages }))
        return
      }

      // Validate each file
      const validFiles: File[] = []
      for (const file of acceptedFiles) {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(t('invalidFileType'))
          continue
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setError(t('fileTooLarge'))
          continue
        }

        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      // Create previews
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])

      // Update uploaded files
      const newFiles = [...uploadedFiles, ...validFiles]
      setUploadedFiles(newFiles)
    },
    [previews.length, maxImages, uploadedFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
  })

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleComplete = () => {
    if (isUploading) return
    if (uploadedFiles.length === 0) {
      setError(t('minImages'))
      return
    }
    setIsUploading(true)
    onUpload(uploadedFiles)
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg">{t('dropHere')}</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              {t('dragOrClick')}
            </p>
            <p className="text-sm text-gray-500">
              {t('fileTypes', { max: maxImages })}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} disabled={isUploading} size="lg">
            {isUploading ? tCommon('uploading') : t('uploadComplete', { count: previews.length })}
          </Button>
        </div>
      )}
    </div>
  )
}
