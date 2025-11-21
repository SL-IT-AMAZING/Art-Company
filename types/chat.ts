export type Step =
  | 'welcome'
  | 'keywords'
  | 'images'
  | 'edit-titles'
  | 'titles'
  | 'content'
  | 'press-release'
  | 'poster'
  | 'marketing'
  | 'virtual'
  | 'complete'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}
