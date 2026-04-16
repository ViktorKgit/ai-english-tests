import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TestProvider } from '@/components/test/TestProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TestProvider>
            {children}
          </TestProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
