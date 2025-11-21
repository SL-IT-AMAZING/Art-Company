'use client'

import { Step } from '@/types/chat'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const STEP_ORDER: { id: Step; label: string }[] = [
  { id: 'welcome', label: '시작' },
  { id: 'keywords', label: '키워드' },
  { id: 'images', label: '이미지' },
  { id: 'titles', label: '타이틀' },
  { id: 'content', label: '본문 생성' },
  { id: 'press-release', label: '보도자료' },
  { id: 'poster', label: '포스터' },
  { id: 'marketing', label: '마케팅' },
  { id: 'virtual', label: '가상 전시' },
  { id: 'complete', label: '완료' },
]

interface StepProgressProps {
  currentStep: Step
  onStepChange?: (step: Step) => void
}

export function StepProgress({ currentStep, onStepChange }: StepProgressProps) {
  const currentIndex = Math.max(
    STEP_ORDER.findIndex((step) => step.id === currentStep),
    0
  )
  const [scrollPosition, setScrollPosition] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const itemsPerPage = 5

  // Auto-scroll to center current step only when moving forward
  useEffect(() => {
    const isMovingForward = currentIndex > previousIndex

    if (isMovingForward) {
      // Center the current step when moving forward
      const centerPosition = Math.max(
        0,
        Math.min(
          currentIndex - Math.floor(itemsPerPage / 2),
          STEP_ORDER.length - itemsPerPage
        )
      )
      setScrollPosition(centerPosition)
    } else {
      // When moving backward, only scroll if current step is out of view
      if (currentIndex < scrollPosition) {
        setScrollPosition(currentIndex)
      } else if (currentIndex >= scrollPosition + itemsPerPage) {
        setScrollPosition(Math.max(0, currentIndex - itemsPerPage + 1))
      }
    }

    setPreviousIndex(currentIndex)
  }, [currentIndex]) // Remove scrollPosition and itemsPerPage from dependencies

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition + itemsPerPage < STEP_ORDER.length

  const handleScrollLeft = () => {
    setScrollPosition((prev) => Math.max(0, prev - 1))
  }

  const handleScrollRight = () => {
    setScrollPosition((prev) => Math.min(STEP_ORDER.length - itemsPerPage, prev + 1))
  }

  const handleStepClick = (stepId: Step, index: number) => {
    // Only allow navigation to completed or current steps
    if (index <= currentIndex && onStepChange) {
      onStepChange(stepId)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 w-full px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleScrollLeft}
        disabled={!canScrollLeft}
        className="h-8 w-8 flex-shrink-0 transition-opacity hover:bg-primary/10"
        aria-label="이전 단계 보기"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 overflow-hidden" style={{ width: '600px' }}>
        <div
          className="flex items-center gap-2 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition * 120}px)` }}
        >
        {STEP_ORDER.map((step, index) => {
          const actualIndex = index
          const isComplete = actualIndex < currentIndex
          const isActive = actualIndex === currentIndex
          const isClickable = actualIndex <= currentIndex && onStepChange

          return (
            <div
              key={step.id}
              className="flex items-center gap-2 transition-all duration-300"
            >
              <button
                onClick={() => handleStepClick(step.id, actualIndex)}
                disabled={!isClickable}
                className={`group flex items-center gap-2 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : isComplete
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {actualIndex + 1}
                </div>
                <span
                  className={`text-xs whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'font-semibold text-foreground'
                      : isComplete
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  } ${isClickable && !isActive ? 'group-hover:text-primary' : ''}`}
                >
                  {step.label}
                </span>
              </button>
              {index < STEP_ORDER.length - 1 && (
                <div
                  className={`w-4 border-t transition-all duration-300 ${
                    actualIndex < currentIndex ? 'border-primary' : 'border-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleScrollRight}
        disabled={!canScrollRight}
        className="h-8 w-8 flex-shrink-0 transition-opacity hover:bg-primary/10"
        aria-label="다음 단계 보기"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
