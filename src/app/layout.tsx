import type { Metadata } from 'next'
import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/500.css'
import '@fontsource/golos-text/600.css'
import '@fontsource/alegreya/400.css'
import '@fontsource/alegreya/400-italic.css'
import '@fontsource/alegreya/500-italic.css'
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
