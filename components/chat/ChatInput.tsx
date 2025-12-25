'use client'

import { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder,
  disabled = false,
}: ChatInputProps) {
  const t = useTranslations('chat')
  const effectivePlaceholder = placeholder || t('messagePlaceholder')
  const isDisabled = disabled || isLoading

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder={effectivePlaceholder}
        disabled={isDisabled}
        className="flex-1"
      />
      <Button type="submit" disabled={isDisabled || !input.trim()}>
        <Send className="w-4 h-4" />
      </Button>
    </form>
  )
}
