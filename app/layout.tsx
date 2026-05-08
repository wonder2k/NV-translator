import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '物流翻译专家 - NVIDIA MiniMax',
  description: '高效、专业的物流地址翻译工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
