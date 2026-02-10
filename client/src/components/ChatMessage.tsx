import { ChatMessage as ChatMessageType } from "../types";
import { Avatar } from "./ui/Avatar";
import { IconButton } from "./ui/IconButton";
import { MarkdownMessage } from "./MarkdownMessage";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  message: ChatMessageType;
  theme?: 'light' | 'dark';
}

export function ChatMessage({ message, theme = 'dark' }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div
      className={`flex gap-3 mb-6 animate-fade-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar role={message.role} size="md" />
      
      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-primary-600 dark:bg-primary-500 text-white rounded-tr-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed">
              <MarkdownMessage content={message.content} theme={theme} />
            </div>
          )}
        </div>

        {!isUser && message.content && (
          <IconButton
            icon={copied ? Check : Copy}
            size="sm"
            variant="ghost"
            label="Copy message"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
    </div>
  );
}
