import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagesList } from "@/components/messages-list"
import { MessageThread } from "@/components/message-thread"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    seller?: string
    product?: string
    conversation?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all conversations (unique sender/receiver pairs)
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name, email),
      receiver:receiver_id (id, full_name, email),
      products (id, title, images)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Group messages by conversation
  const conversations = new Map<string, any>()

  messages?.forEach((message) => {
    const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
    const conversationKey = [user.id, otherUserId].sort().join("-")

    if (!conversations.has(conversationKey)) {
      conversations.set(conversationKey, {
        id: conversationKey,
        otherUser: message.sender_id === user.id ? message.receiver : message.sender,
        lastMessage: message,
        unreadCount: 0,
      })
    }

    // Count unread messages
    if (message.receiver_id === user.id && !message.read) {
      const conv = conversations.get(conversationKey)
      if (conv) conv.unreadCount++
    }
  })

  const conversationsList = Array.from(conversations.values())

  // Determine active conversation
  let activeConversationId = params.conversation
  if (params.seller && !activeConversationId) {
    activeConversationId = [user.id, params.seller].sort().join("-")
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="mt-2 text-muted-foreground">Chat with buyers and sellers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr] lg:h-[600px]">
        <MessagesList conversations={conversationsList} activeId={activeConversationId} />
        <MessageThread
          conversationId={activeConversationId}
          sellerId={params.seller}
          productId={params.product}
          userId={user.id}
        />
      </div>
    </div>
  )
}
