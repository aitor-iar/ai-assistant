export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  systemPrompt?: string;
}
