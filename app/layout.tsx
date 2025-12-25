import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Art Wizard',
  description: 'AI-powered Digital Curator Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
