"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Website, Category } from "@/types"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  recommendations?: Website[]
}

interface AIChatBoxProps {
  isOpen: boolean
  onClose: () => void
  websites: Website[]
  categories: Category[]
  onVisitWebsite: (website: Website) => void
}

export function AIChatBox({ isOpen, onClose, websites, categories, onVisitWebsite }: AIChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "你好！我是你的智能导航助手 🤖\n\n我可以帮你：\n• 推荐相关网站\n• 分析使用习惯\n• 回答各种问题\n\n试试问我推荐一些设计网站或者其他任何问题吧！",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // AI回复逻辑 - 支持流式响应和AI推荐
  const generateAIResponse = async (userMessage: string): Promise<{ content: string; recommendations?: Website[] }> => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => m.type !== 'ai' || m.id === 'welcome').map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          websites,
          categories
        }),
      })

      if (!response.ok) {
        throw new Error('AI服务暂时不可用')
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let finalRecommendations: Website[] = []

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      // 创建临时AI消息用于实时更新
      const tempMessageId = Date.now().toString()
      setMessages(prev => [...prev, {
        id: tempMessageId,
        type: 'ai',
        content: '正在思考...',
        timestamp: new Date()
      }])

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              
              if (data === '[DONE]') {
                break
              }
              
              try {
                const parsed = JSON.parse(data)
                
                // 处理内容更新
                if (parsed.content) {
                  fullContent += parsed.content
                  
                  // 清理推荐标记后显示给用户
                  const cleanContent = fullContent.replace(/\[RECOMMEND:[^\]]+\]/g, '')
                  
                  // 实时更新消息内容
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempMessageId 
                      ? { ...msg, content: cleanContent }
                      : msg
                  ))
                }
                
                // 处理推荐
                if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
                  finalRecommendations = parsed.recommendations
                  
                  // 更新消息添加推荐
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempMessageId 
                      ? { ...msg, recommendations: finalRecommendations }
                      : msg
                  ))
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return { content: fullContent, recommendations: finalRecommendations }

    } catch (error) {
      console.error('AI响应生成失败:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    // 添加用户消息
    const userMessageObj: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessageObj])

    try {
      // 生成AI回复（支持流式）
      const aiResponse = await generateAIResponse(userMessage)
      
      // 如果有推荐网站，更新最后一条AI消息
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        setMessages(prev => {
          const updated = [...prev]
          const lastAiMessage = updated.findLast(m => m.type === 'ai')
          if (lastAiMessage) {
            lastAiMessage.recommendations = aiResponse.recommendations
          }
          return updated
        })
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      
      // 添加错误消息
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: "ai",
        content: "抱歉，我遇到了一些问题。请稍后再试或检查网络连接。",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      
      toast({
        title: "消息发送失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleWebsiteClick = (website: Website) => {
    onVisitWebsite(website)
    toast({
      title: "正在打开网站",
      description: `即将访问 ${website.title}`,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">AI 导航助手</h3>
              {!isMinimized && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{isLoading ? "正在思考..." : "在线"}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* 消息区域 */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-[480px] bg-slate-50/30 dark:bg-slate-950/30">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}>
                    {message.type === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[280px] ${message.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-3 rounded-2xl shadow-sm ${
                          message.type === "user"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {message.type === "user" ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-slate prose-headings:mb-2 prose-p:mb-2 prose-p:leading-relaxed prose-ul:mb-2 prose-ol:mb-2 prose-li:my-0">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                // 自定义代码块样式
                                code: ({node, inline, ...props}) => 
                                  inline 
                                    ? <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                                    : <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                                        <code {...props} />
                                      </pre>,
                                // 自定义链接样式
                                a: ({node, ...props}) => 
                                  <a 
                                    className="text-blue-600 dark:text-blue-400 hover:underline" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    {...props} 
                                  />,
                                // 自定义引用样式
                                blockquote: ({node, ...props}) => 
                                  <blockquote 
                                    className="border-l-4 border-blue-300 dark:border-blue-600 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg" 
                                    {...props} 
                                  />
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* 网站推荐卡片 */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.recommendations.map((website) => (
                            <div
                              key={website.id}
                              onClick={() => handleWebsiteClick(website)}
                              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                  {website.favicon ? (
                                    <img
                                      src={website.favicon || "/placeholder.svg"}
                                      alt={website.title}
                                      className="w-6 h-6 object-contain"
                                    />
                                  ) : (
                                    <Sparkles className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                    {website.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {website.description}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                >
                                  {website.visitCount}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="h-4 w-4 text-white dark:text-slate-900" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="问我任何问题..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl h-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl h-10 px-4 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
