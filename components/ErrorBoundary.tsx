'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">
              죄송합니다. 페이지를 로드하는 중 오류가 발생했습니다.
              다시 시도해 주세요.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.reload()
                }}
              >
                다시 시도
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                홈으로 가기
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left">
                <details className="bg-gray-100 p-4 rounded text-sm">
                  <summary className="cursor-pointer font-semibold">
                    Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
