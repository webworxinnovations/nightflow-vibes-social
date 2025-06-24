
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, DollarSign } from "lucide-react";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { TipDialog } from "./TipDialog";

interface StreamChatProps {
  streamId: string;
  streamerId: string;
}

export const StreamChat = ({ streamId, streamerId }: StreamChatProps) => {
  const [message, setMessage] = useState("");
  const [showTipDialog, setShowTipDialog] = useState(false);
  const { messages, isLoading, sendMessage } = useRealTimeChat(streamId);
  const { user } = useSupabaseAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      await sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Chat</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTipDialog(true)}
            className="flex items-center gap-1"
          >
            <DollarSign className="h-4 w-4" />
            Tip
          </Button>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        {isLoading ? (
          <div className="text-center text-muted-foreground">
            Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No messages yet. Be the first to say hello! 👋
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarFallback className="text-xs">
                    {msg.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.created_at)}
                    </span>
                    {msg.is_tip && msg.tip_amount && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 rounded">
                        ${msg.tip_amount}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm break-words ${msg.is_tip ? 'font-semibold text-yellow-600 dark:text-yellow-400' : ''}`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {user ? (
        <form onSubmit={handleSendMessage} className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              maxLength={500}
            />
            <Button type="submit" size="sm" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-3 border-t text-center text-sm text-muted-foreground">
          Please log in to chat
        </div>
      )}

      <TipDialog
        open={showTipDialog}
        onOpenChange={setShowTipDialog}
        streamId={streamId}
        streamerId={streamerId}
      />
    </div>
  );
};
