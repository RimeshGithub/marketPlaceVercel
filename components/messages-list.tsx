"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

type Conversation = {
  id: string
  otherUser: {
    id: string
    full_name: string | null
    email: string
  }
  lastMessage: {
    content: string
    created_at: string
  }
  unreadCount: number
}

export function MessagesList({
  conversations,
  activeId,
}: {
  conversations: Conversation[]
  activeId?: string
}) {
  const router = useRouter()

  if (conversations.length === 0) {
    return (
      <Card className="lg:h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Start a conversation with a seller from a product page
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:h-full lg:overflow-hidden">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 lg:overflow-y-auto lg:h-[calc(100%-80px)]">
        <div className="divide-y">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => router.push(`/messages?conversation=${conversation.id}`)}
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-muted",
                activeId === conversation.id && "bg-muted",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {conversation.otherUser.full_name || conversation.otherUser.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="shrink-0">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
