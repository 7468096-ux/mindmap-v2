import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Mindmap — Интерактивная карта AI терминологии',
  description: 'Визуальная карта концепций искусственного интеллекта и машинного обучения',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="font-sans">{children}</body>
    </html>
  )
}
