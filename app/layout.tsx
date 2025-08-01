import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'CodeShine 导航 - 智能网站导航助手',
  description: '一个现代化的智能网站导航平台，集成AI助手，帮助您快速发现和管理常用网站。支持分类管理、智能推荐、使用统计等功能。',
  keywords: ['网站导航', '智能导航', 'AI助手', '网站收藏', '书签管理', 'CodeShine'],
  authors: [{ name: 'CodeShine Team' }],
  creator: 'CodeShine',
  publisher: 'CodeShine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nav.codeshine.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CodeShine 导航 - 智能网站导航助手',
    description: '一个现代化的智能网站导航平台，集成AI助手，帮助您快速发现和管理常用网站。',
    url: 'https://nav.codeshine.com',
    siteName: 'CodeShine 导航',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeShine 导航 - 智能网站导航助手',
    description: '一个现代化的智能网站导航平台，集成AI助手，帮助您快速发现和管理常用网站。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/placeholder-logo.svg',
    shortcut: '/placeholder-logo.svg',
    apple: '/placeholder-logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
