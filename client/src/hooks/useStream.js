import { useCallback } from 'react';
import { useChat } from '../context/ChatContext.jsx';

export function useStream() {
  const { setIsStreaming, setStreamingContent, appendUserMessage, finalizeAssistantMessage } = useChat();

  const sendMessage = useCallback(async (conversationId, prompt) => {
    if (!conversationId || !prompt.trim()) return;

    // Optimistically show user message
    appendUserMessage(prompt.trim());
    setIsStreaming(true);
    setStreamingContent('');

    const token = localStorage.getItem('token');
    let fullContent = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Stream request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      finalizeAssistantMessage(fullContent);
    } catch (error) {
      console.error('Stream error:', error);
      finalizeAssistantMessage(`⚠️ ${error.message}`);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [appendUserMessage, setIsStreaming, setStreamingContent, finalizeAssistantMessage]);

  return { sendMessage };
}
