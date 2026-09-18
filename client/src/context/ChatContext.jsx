import { createContext, useContext, useState, useCallback } from 'react';
import * as conversationsApi from '../api/conversations.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null); // full object with messages
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const { data } = await conversationsApi.getConversations();
      setConversations(data);
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const selectConversation = useCallback(async (id) => {
    setLoadingMessages(true);
    try {
      const { data } = await conversationsApi.getConversation(id);
      setActiveConversation(data);
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createNewConversation = useCallback(async (tone = 'Professional') => {
    const { data } = await conversationsApi.createConversation(tone);
    setConversations((prev) => [data, ...prev]);
    setActiveConversation(data);
    return data;
  }, []);

  const deleteConversation = useCallback(async (id) => {
    await conversationsApi.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (activeConversation?._id === id) setActiveConversation(null);
  }, [activeConversation]);

  const changeTone = useCallback(async (id, tone) => {
    const { data } = await conversationsApi.updateTone(id, tone);
    setActiveConversation((prev) => prev ? { ...prev, tone: data.tone } : prev);
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, tone: data.tone } : c))
    );
  }, []);

  // Append a user message optimistically
  const appendUserMessage = useCallback((content) => {
    setActiveConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content, timestamp: new Date() }],
    }));
  }, []);

  // Finalize AI message after stream completes
  const finalizeAssistantMessage = useCallback((content) => {
    setActiveConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'assistant', content, timestamp: new Date() }],
    }));
    // Update sidebar title if it changed (refresh sidebar list)
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      isStreaming,
      streamingContent,
      loadingConversations,
      loadingMessages,
      setIsStreaming,
      setStreamingContent,
      fetchConversations,
      selectConversation,
      createNewConversation,
      deleteConversation,
      changeTone,
      appendUserMessage,
      finalizeAssistantMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
