import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SettingsPanel } from "./components/SettingsPanel";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { Button } from "./components/ui/Button";
import { ChatMessage as ChatMessageType } from "./types";
import { useTheme } from "./utils/theme";
import { MessageSquare, Trash2 } from "lucide-react";

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Prepare messages for API (without IDs and timestamps)
      const apiMessages = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: systemPrompt || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                // Update the assistant message with new content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg
                  )
                );
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, there was an error processing your request. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "What are the best practices for React development?",
    "Help me debug this code snippet",
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <div className="mb-6 inline-flex p-4 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10">
                  <MessageSquare className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Start a conversation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Type a message below or try one of these suggestions to begin chatting with the AI.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all duration-200 group"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} theme={theme} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}

export default App;
