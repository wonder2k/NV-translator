"use client";
import dynamic from 'next/dynamic';

// 使用 dynamic import 并禁用服务端渲染 (ssr: false)
// 这是解决 "Unsupported Server Component type" 的万能药
const TranslatorUI = dynamic(() => import('@/components/TranslatorUI'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function Home() {
  return <TranslatorUI />;
}
