import './globals.css'

export const metadata = {
  title: '物流 AI 翻译',
  description: '专业的地址与货品名翻译工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  )
}
