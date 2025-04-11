import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeProvider from '@/providers/theme-provider'
import { neobrutalism } from '@clerk/themes';
import { Analytics } from '@vercel/analytics/react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Elevance',
  description: 'Elevate your skills. Advance your career.',
  icons: "favicon.png"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: neobrutalism,
        elements: {
          // Style the primary button (sign in/up buttons)
          formButtonPrimary:
            'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors roobert-font',

        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <Analytics />
      <html lang='en' className='scroll-smooth'>
        <body className='antialiased'>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className='min-h-screen flex flex-col'>
              <Header />
              <main className='flex-grow'>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider >
  )
}