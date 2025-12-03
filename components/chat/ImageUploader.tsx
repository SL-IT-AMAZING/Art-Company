'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
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
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError('')

      // Validate file count
      if (previews.length + acceptedFiles.length > maxImages) {
        setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
        return
      }

      // Validate each file
      const validFiles: File[] = []
      for (const file of acceptedFiles) {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError('JPG, PNG, WebP 파일만 업로드 가능합니다.')
          continue
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setError('파일 크기는 10MB 이하여야 합니다.')
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
    if (isUploading) return  // 중복 클릭 방지
    if (uploadedFiles.length === 0) {
      setError('최소 1개 이상의 이미지를 업로드해주세요.')
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
          <p className="text-lg">이미지를 여기에 놓으세요...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG, WebP (최대 10MB, {maxImages}개까지)
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
            {isUploading ? '업로드 중...' : `이미지 ${previews.length}개 업로드 완료`}
          </Button>
        </div>
      )}
    </div>
  )
}
