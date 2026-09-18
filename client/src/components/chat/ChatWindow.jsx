import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useStream } from '../../hooks/useStream.js';
import MessageBubble from './MessageBubble.jsx';
import ToneToggle from '../ui/ToneToggle.jsx';
import { Send, Square } from 'lucide-react';

export default function ChatWindow() {
  const {
    activeConversation,
    isStreaming,
    streamingContent,
    loadingMessages,
  } = useChat();
  const { sendMessage } = useStream();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, streamingContent]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !activeConversation) return;
    const prompt = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(activeConversation._id, prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const messages = activeConversation?.messages || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">
          {activeConversation?.title || 'New Conversation'}
        </h2>
        <ToneToggle />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Send a message to start the conversation.
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
              Tone: <span className="font-medium">{activeConversation?.tone}</span>
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex justify-start animate-slide-in">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-600 dark:text-brand-400 text-xs font-bold">AI</span>
              </div>
              <div className="chat-bubble-ai">
                {streamingContent ? (
                  <div className="prose-chat text-sm">
                    <span>{streamingContent}</span>
                    <span className="cursor-blink" />
                  </div>
                ) : (
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <div className="flex items-end gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 focus-within:border-brand-500 dark:focus-within:border-brand-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Message Quantiphi… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 leading-6 max-h-44 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            {isStreaming ? <Square size={14} /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
