import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in">
        <div className="flex flex-col items-end gap-1">
          <div className="chat-bubble-user text-sm leading-relaxed">
            {message.content}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-slide-in">
      <div className="flex items-start gap-3 max-w-[80%]">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-brand-600 dark:text-brand-400 text-xs font-bold">AI</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="chat-bubble-ai text-sm leading-relaxed">
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
