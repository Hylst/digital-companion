import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Bot, User } from "lucide-react";
import { Message } from "@/lib/types";
import { useCompanionContext } from "@/context/CompanionContext";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

export default function ChatArea({ messages, isLoading, className }: ChatAreaProps) {
  const { activeCompanion } = useCompanionContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper to format the message content with proper line breaks and links
  const formatMessageContent = (content: string) => {
    // Convert URLs to clickable links
    const linkedContent = content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noreferrer" class="text-primary underline">$1</a>'
    );

    // Convert line breaks to <br> tags
    return linkedContent.split('\n').map((line, i) => (
      <p key={i} dangerouslySetInnerHTML={{ __html: line }} className={i > 0 ? "mt-2" : ""} />
    ));
  };

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-6 ${className}`}>
      {messages.length === 0 && !isLoading && activeCompanion && (
        <div className="flex items-start space-x-3 message-bubble">
          <Avatar className="w-8 h-8 border">
            <AvatarImage src={activeCompanion.avatar} alt={activeCompanion.name} />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-light rounded-bubble rounded-tl-none p-3 max-w-[85%]">
            <p className="text-base">
              Hi there! I'm {activeCompanion.name}, your {activeCompanion.role.toLowerCase()}! I'm here to chat and help you. How are you feeling today?
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start ${
            message.role === "user" ? "justify-end space-x-3" : "space-x-3"
          } message-bubble`}
        >
          {message.role === "assistant" && (
            <Avatar className="w-8 h-8 border">
              <AvatarImage src={activeCompanion?.avatar} alt={activeCompanion?.name} />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={
              message.role === "user"
                ? "user-bubble"
                : "ai-bubble"
            }
          >
            {formatMessageContent(message.content)}
            
            {/* Display image if present */}
            {message.imageUrl && (
              <div className="mt-3">
                <div className="rounded-bubble overflow-hidden">
                  <img
                    src={message.imageUrl}
                    alt="Generated image"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    <span>Regenerate Image</span>
                  </Button>
                  <Button variant="link" size="sm" className="text-xs text-gray-500 p-0 h-auto">
                    <Download className="h-3 w-3 mr-1" />
                    <span>Save Image</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {message.role === "user" && (
            <Avatar className="w-8 h-8 bg-gray-300">
              <AvatarFallback>
                <User className="h-4 w-4 text-gray-500" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {/* AI Typing Indicator */}
      {isLoading && (
        <div className="flex items-start space-x-3 message-bubble">
          <Avatar className="w-8 h-8 border">
            <AvatarImage src={activeCompanion?.avatar} alt={activeCompanion?.name} />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-light rounded-bubble rounded-tl-none p-3 inline-flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
