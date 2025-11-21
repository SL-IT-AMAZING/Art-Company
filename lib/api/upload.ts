export const uploadApi = {
  uploadArtwork: async (file: File): Promise<{ url: string; path: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/artwork', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Upload failed: ${response.status}`)
    }

    return response.json()
  },

  uploadMultiple: async (files: File[]): Promise<{ url: string; path: string }[]> => {
    const uploadPromises = files.map((file) => uploadApi.uploadArtwork(file))
    return Promise.all(uploadPromises)
  },
}
