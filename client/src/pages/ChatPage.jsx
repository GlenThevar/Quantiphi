import { useEffect } from 'react';
import { ChatProvider, useChat } from '../context/ChatContext.jsx';
import ConversationList from '../components/sidebar/ConversationList.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { MessageSquare } from 'lucide-react';

function ChatLayout() {
  const { fetchConversations, activeConversation } = useChat();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <ConversationList />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-600/20 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Quantiphi Chat
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Select a conversation from the sidebar or start a new one to begin chatting with AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
