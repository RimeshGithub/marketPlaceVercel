"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ro } from "date-fns/locale"

type Message = {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  product_id: string | null
  created_at: string
  sender: {
    full_name: string | null
    email: string
  }
  receiver: {
    full_name: string | null
    email: string
  }
}

export function MessageThread({
  conversationId,
  sellerId,
  productId,
  userId,
}: {
  conversationId?: string
  sellerId?: string
  productId?: string
  userId: string
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<{ id: string; name: string } | null>(null)
  const [product, setProduct] = useState<{ id: string; title: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId && !sellerId) {
      setIsLoading(false)
      return
    }

    loadMessages()
  }, [conversationId, sellerId, productId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // If starting new conversation with seller
      if (sellerId && !conversationId) {
        // Get seller info
        const { data: sellerData } = await supabase.from("profiles").select("*").eq("id", sellerId).maybeSingle()

        if (sellerData) {
          setOtherUser({
            id: sellerData.id,
            name: sellerData.full_name || sellerData.email,
          })
        }

        // Get product info if provided
        if (productId) {
          const { data: productData } = await supabase.from("products").select("*").eq("id", productId).maybeSingle()

          if (productData) {
            setProduct({
              id: productData.id,
              title: productData.title,
            })
          }
        }

        const { data: existingMessages } = await supabase
          .from("messages")
          .select(`
            *,
            sender:sender_id (full_name, email),
            receiver:receiver_id (full_name, email)
          `)
          .eq("product_id", productId || null)
          .or(
            `and(sender_id.eq.${userId},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${userId})`,
          )
          .order("created_at", { ascending: true })

        setMessages(existingMessages || [])
      } else if (conversationId) {
        const parts = conversationId.split("-")
        const groupSize = Math.floor(parts.length / 3)

        const buyerId = parts.slice(0, groupSize).join("-")
        const sellerId = parts.slice(groupSize, groupSize * 2).join("-")
        const productId = parts.slice(groupSize * 2).join("-")

        // Determine the other user ID
        const otherUserId = buyerId === userId ? sellerId : buyerId

        const { data: userData } = await supabase.from("profiles").select("*").eq("id", otherUserId).maybeSingle()

        if (userData) {
          setOtherUser({
            id: userData.id,
            name: userData.full_name || userData.email,
          })
        }

        // Get product info if available
        if (productId) {
          const { data: productData } = await supabase.from("products").select("*").eq("id", productId).maybeSingle()

          if (productData) {
            setProduct({
              id: productData.id,
              title: productData.title,
            })
          }
        }

        const { data: conversationMessages } = await supabase
          .from("messages")
          .select(`
            *,
            sender:sender_id (full_name, email),
            receiver:receiver_id (full_name, email)
          `)
          .eq("product_id", productId || null)
          .or(
            `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
          )
          .order("created_at", { ascending: true })

        setMessages(conversationMessages || [])

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("receiver_id", userId)
          .eq("sender_id", otherUserId)
          .eq("product_id", productId || null)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !otherUser) return

    const parts = conversationId?.split("-")
    const groupSize = parts && Math.floor(parts.length / 3)
    const productId = groupSize && parts.slice(groupSize * 2).join("-")

    setIsSending(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: userId,
          receiver_id: otherUser.id,
          product_id: productId || null,
          content: newMessage.trim(),
        })
        .select(`
          *,
          sender:sender_id (full_name, email),
          receiver:receiver_id (full_name, email)
        `)
        .single()

      if (error) throw error

      setMessages([...messages, data])
      setNewMessage("")
      router.refresh()

      // Update URL if this was a new conversation
      if (!conversationId) {
        const newConversationId = [userId, otherUser.id, productId || "no-product"].join("-")
        router.push(`/messages?conversation=${newConversationId}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  if (!conversationId && !sellerId) {
    return (
      <Card className="lg:h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center">Choose a conversation from the list to start messaging</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="lg:h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0">
      <CardHeader className="border-b">
        <CardTitle>{otherUser?.name || "Unknown User"}</CardTitle>
        {product && (
          <Link href={`/products/${product.id}`} className="text-sm text-muted-foreground hover:text-primary">
            Product: {product.title}
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-4 lg:h-60 h-100 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === userId
              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(message.created_at).toUTCString().split(" ").slice(0, 4).join(" ") + " " + new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <div className="border-t px-4 pt-4">
        <div className="flex gap-2 items-center">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            rows={2}
            className="resize-none"
          />
          <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()} size="icon" className="shrink-0">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}
