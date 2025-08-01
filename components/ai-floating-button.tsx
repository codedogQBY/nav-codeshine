"use client"

import { useState } from "react"
import { Bot, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIFloatingButtonProps {
  onClick: () => void
  hasUnread?: boolean
}

export function AIFloatingButton({ onClick, hasUnread = false }: AIFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-32 right-8 z-40">
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group border-0"
      >
        <div className="relative">
          {isHovered ? (
            <MessageCircle className="h-7 w-7 text-white transition-transform duration-200" />
          ) : (
            <Bot className="h-7 w-7 text-white transition-transform duration-200" />
          )}

          {/* 闪烁的星星效果 */}
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-pulse" />
        </div>

        {/* 未读消息提示 */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}

        {/* 悬浮提示 */}
        <div
          className={`absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-lg ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          AI 导航助手
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-slate-100"></div>
        </div>

        {/* 呼吸光环效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 opacity-20 animate-ping"></div>
      </Button>
    </div>
  )
}
