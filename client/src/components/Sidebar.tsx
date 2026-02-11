import { useState } from "react";
import { Plus, Settings, Palette, FileText, Menu, Trash2, MessageSquare } from "lucide-react";
import { Theme } from "../utils/theme";
import { Conversation } from "../types";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  onNewConversation: () => void;
  onToggleSidebar: () => void;
  isOpen: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  theme,
  onToggleTheme,
  systemPrompt,
  onSystemPromptChange,
  onNewConversation,
  onToggleSidebar,
  isOpen,
  conversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);

  const handleSettingsClick = () => {
    if (!isOpen) {
      setShowFloatingSettings(!showFloatingSettings);
    } else {
      setShowSettings(!showSettings);
    }
  };

  const handleMenuToggle = () => {
    if (isOpen) {
      // Si está abierto y lo minimizamos, cerrar ajustes
      setShowSettings(false);
    } else if (!isOpen && showFloatingSettings) {
      // Si está cerrado, panel flotante abierto y lo abrimos, mantener estado
      setShowSettings(true);
    }
    setShowFloatingSettings(false);
    onToggleSidebar();
  };

  return (
    <>
      <div
        className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
          isOpen ? "w-80" : "w-16"
        } overflow-hidden flex-shrink-0`}
      >
      <div className="flex flex-col h-full">
        {/* Menu Button - Siempre visible */}
        <div className="p-4">
          <button
            onClick={handleMenuToggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            {isOpen && <span className="font-medium text-gray-900 dark:text-gray-100">Menu</span>}
          </button>
        </div>

        {/* New Conversation Button - Always visible */}
        <div className="p-4">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
          >
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            {isOpen && <span className="font-medium text-gray-900 dark:text-gray-100">New Conversation</span>}
          </button>
        </div>

        {/* Conversation History Section - Solo visible cuando isOpen */}
        <div className="flex-1 overflow-y-auto">
          {isOpen && (
            <div className="px-4 space-y-2">
              {/* History */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                  History
                </h3>
                {conversations.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No previous conversations
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          conversation.id === currentConversationId
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <button
                          onClick={() => onLoadConversation(conversation.id)}
                          className="flex-1 text-left text-sm truncate"
                          title={conversation.title}
                        >
                          {conversation.title}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Section - Siempre visible en el fondo */}
        <div className="p-4">
          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors justify-center rounded-lg"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            {isOpen && <span className="font-medium text-gray-900 dark:text-gray-100">Settings</span>}
          </button>

          {showSettings && isOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mt-3 pt-4">
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Change Theme</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {theme}
                </span>
              </button>

              {/* System Prompt */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chat Instructions
                  </label>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange(e.target.value)}
                  placeholder="e.g., You are a helpful assistant..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                />
                {systemPrompt && (
                  <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                    Custom instructions active
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Floating Settings Panel - cuando sidebar está cerrado */}
    {showFloatingSettings && !isOpen && (
      <div className="fixed left-16 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shadow-lg z-40 max-h-[calc(100vh-80px)]">
        <div className="p-4 border-t border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={() => setShowFloatingSettings(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 pt-4">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-gray-100">Change Theme</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 capitalize">
              {theme}
            </span>
          </button>

          {/* System Prompt */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Chat Instructions
              </label>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              placeholder="e.g., You are a helpful assistant..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            />
            {systemPrompt && (
              <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                Custom instructions active
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
}
