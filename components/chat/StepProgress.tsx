'use client'

import { Step } from '@/types/chat'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

type StepConfig = { id: Step; labelKey: string }

const STEP_CONFIG: StepConfig[] = [
  { id: 'welcome', labelKey: 'welcome' },
  { id: 'keywords', labelKey: 'keywords' },
  { id: 'images', labelKey: 'images' },
  { id: 'titles', labelKey: 'titles' },
  { id: 'content', labelKey: 'content' },
  { id: 'press-release', labelKey: 'pressRelease' },
  { id: 'poster', labelKey: 'poster' },
  { id: 'marketing', labelKey: 'marketing' },
  { id: 'virtual', labelKey: 'virtual' },
  { id: 'complete', labelKey: 'complete' },
]

interface StepProgressProps {
  currentStep: Step
  onStepChange?: (step: Step) => void
}

export function StepProgress({ currentStep, onStepChange }: StepProgressProps) {
  const t = useTranslations('steps')
  const currentIndex = Math.max(
    STEP_CONFIG.findIndex((step) => step.id === currentStep),
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
          STEP_CONFIG.length - itemsPerPage
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
  const canScrollRight = scrollPosition + itemsPerPage < STEP_CONFIG.length

  const handleScrollLeft = () => {
    setScrollPosition((prev) => Math.max(0, prev - 1))
  }

  const handleScrollRight = () => {
    setScrollPosition((prev) => Math.min(STEP_CONFIG.length - itemsPerPage, prev + 1))
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
        aria-label={t('viewPrevious')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 overflow-hidden" style={{ width: '600px' }}>
        <div
          className="flex items-center gap-2 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition * 120}px)` }}
        >
        {STEP_CONFIG.map((step, index) => {
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
                  {t(step.labelKey)}
                </span>
              </button>
              {index < STEP_CONFIG.length - 1 && (
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
        aria-label={t('viewNext')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
