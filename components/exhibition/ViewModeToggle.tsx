'use client'

import { motion } from 'framer-motion'

export type ViewMode = '2d' | '3d'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * Toggle button to switch between 2D parallax and 3D voxel gallery views
 */
export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 bg-white rounded-full shadow-lg overflow-hidden"
    >
      <div className="flex">
        {/* 2D View Button */}
        <button
          onClick={() => onChange('2d')}
          className={`
            relative px-6 py-3 font-medium text-sm transition-colors
            ${mode === '2d' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {mode === '2d' && (
            <motion.div
              layoutId="activeBackground"
              className="absolute inset-0 bg-black"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            2D 뷰
          </span>
        </button>

        {/* 3D View Button */}
        <button
          onClick={() => onChange('3d')}
          className={`
            relative px-6 py-3 font-medium text-sm transition-colors
            ${mode === '3d' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {mode === '3d' && (
            <motion.div
              layoutId="activeBackground"
              className="absolute inset-0 bg-black"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            3D 갤러리
          </span>
        </button>
      </div>

      {/* Hint text */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: mode === '3d' ? 1 : 0,
          height: mode === '3d' ? 'auto' : 0
        }}
        className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 text-center"
      >
        클릭하여 입장 • WASD로 이동
      </motion.div>
    </motion.div>
  )
}
