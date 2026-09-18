import { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Plus, Trash2, MessageSquare, Sun, Moon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ConversationList() {
  const { conversations, activeConversation, selectConversation, createNewConversation, deleteConversation, loadingConversations } = useChat();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleNew = async () => {
    await createNewConversation();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={`flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">Quantiphi</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <button
          onClick={handleNew}
          className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Plus size={16} className="flex-shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loadingConversations ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          !collapsed && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 px-2">
              No conversations yet. Start a new chat!
            </p>
          )
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => selectConversation(conv._id)}
              className={`sidebar-item group ${activeConversation?._id === conv._id ? 'active' : ''}`}
              title={conv.title}
            >
              <MessageSquare size={15} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-xs">{conv.title || 'New Conversation'}</span>
                  <button
                    onClick={(e) => handleDelete(e, conv._id)}
                    disabled={deletingId === conv._id}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {isDark ? <Sun size={15} className="flex-shrink-0" /> : <Moon size={15} className="flex-shrink-0" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={logout}
          className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={user?.email}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && (
            <span className="truncate text-xs">{user?.email}</span>
          )}
        </button>
      </div>
    </div>
  );
}
