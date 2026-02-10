import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 transition-all duration-200 min-h-[52px] shadow-sm hover:shadow-md focus:shadow-md"
          style={{ 
            maxHeight: '200px',
            overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-primary-600 dark:bg-primary-500 px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 min-w-[100px] flex items-center justify-center gap-2"
        >
          {disabled ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span className="hidden sm:inline">Sending</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
