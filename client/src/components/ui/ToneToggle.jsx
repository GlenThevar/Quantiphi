import { useChat } from '../../context/ChatContext.jsx';

const TONES = ['Professional', 'Casual', 'Concise'];

const TONE_DESCRIPTIONS = {
  Professional: 'Formal & precise',
  Casual: 'Friendly & warm',
  Concise: 'Brief & direct',
};

export default function ToneToggle() {
  const { activeConversation, changeTone, isStreaming } = useChat();
  const currentTone = activeConversation?.tone || 'Professional';

  const handleToneChange = async (tone) => {
    if (tone === currentTone || isStreaming || !activeConversation) return;
    await changeTone(activeConversation._id, tone);
  };

  return (
    <div className="flex items-center gap-1.5" title={TONE_DESCRIPTIONS[currentTone]}>
      <span className="text-xs text-gray-400 dark:text-gray-500 mr-1 hidden sm:block">Tone:</span>
      {TONES.map((tone) => (
        <button
          key={tone}
          onClick={() => handleToneChange(tone)}
          disabled={isStreaming}
          className={`tone-btn ${
            currentTone === tone
              ? 'active'
              : 'inactive dark:border-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
          }`}
          title={TONE_DESCRIPTIONS[tone]}
        >
          {tone}
        </button>
      ))}
    </div>
  );
}
