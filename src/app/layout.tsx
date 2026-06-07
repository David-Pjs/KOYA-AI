import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans, Caveat } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

// Used only for the teacher's pen: circled errors, margin notes.
const caveat = Caveat({
  variable: '--font-hand',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Koya — find the gap before the exam does',
  description:
    'Koya helps a teacher with sixty students find the one hidden gap underneath the whole class, where it came from, and what to do tomorrow. Built for the African classroom: pen, paper, no student devices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
