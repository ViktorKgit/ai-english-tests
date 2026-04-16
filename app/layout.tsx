import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TestProvider } from '@/components/test/TestProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'English Level Test - Determine Your CEFR Level',
  description: 'Test your English proficiency level with our adaptive placement test and level-specific tests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TestProvider>
          {children}
        </TestProvider>
      </body>
    </html>
  )
}
