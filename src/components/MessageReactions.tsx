import React, { useState } from 'react';
import { MessageReaction, EnhancedChatMessage } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MessageReactionsProps {
  message: EnhancedChatMessage;
  onReact: (messageId: string, emoji: string) => void;
  className?: string;
}

const REACTION_EMOJIS = ['😍', '🥰', '😂', '😘', '🔥', '💕', '👏', '😢', '😮', '😡'];

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  message, 
  onReact, 
  className = '' 
}) => {
  const { currentTheme } = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowEmojiPicker(false);
  };

  const getReactionCount = (emoji: string): number => {
    if (!message.reactions) return 0;
    const reaction = message.reactions.find(r => r.emoji === emoji);
    return reaction?.count || 0;
  };

  const hasUserReacted = (emoji: string): boolean => {
    if (!message.reactions) return false;
    return message.reactions.some(r => r.emoji === emoji && r.userId === 'current-user');
  };

  const existingReactions = message.reactions?.filter(r => r.count > 0) || [];

  return (
    <div className={`relative ${className}`}>
      {/* Existing Reactions */}
      {existingReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {existingReactions.map((reaction, index) => (
            <button
              key={`${reaction.emoji}-${index}`}
              onClick={() => handleReaction(reaction.emoji)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                ${hasUserReacted(reaction.emoji)
                  ? currentTheme.id === 'cyberpunk'
                    ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary animate-neon-flicker-lite'
                    : 'bg-pink-100 text-pink-600 border border-pink-300'
                  : currentTheme.id === 'cyberpunk'
                    ? 'bg-gray-800/50 text-cyber-secondary border border-cyber-secondary/30 hover:border-cyber-primary/50'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                }
                hover:scale-105 active:scale-95
              `}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full transition-all
            ${currentTheme.id === 'cyberpunk'
              ? 'bg-gray-800/50 text-cyber-secondary border border-cyber-secondary/30 hover:border-cyber-primary/50 hover:text-cyber-primary'
              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
            }
            hover:scale-110 active:scale-95
          `}
          title="Tepki ekle"
        >
          <span className="text-sm">😊</span>
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowEmojiPicker(false)}
            />
            
            {/* Emoji Picker Popup */}
            <div className={`
              absolute bottom-10 left-0 z-50 p-3 rounded-xl border-2 shadow-xl
              ${currentTheme.id === 'cyberpunk'
                ? 'bg-gray-900/95 border-cyber-primary/30 shadow-neon-blue backdrop-blur-lg'
                : 'bg-white border-gray-200 shadow-lg backdrop-blur-sm'
              }
              animate-in fade-in-50 slide-in-from-bottom-2 duration-200
            `}>
              <div className="grid grid-cols-5 gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
                      ${currentTheme.id === 'cyberpunk'
                        ? 'hover:bg-cyber-primary/20 hover:shadow-neon-blue/50'
                        : 'hover:bg-gray-100'
                      }
                      hover:scale-125 active:scale-110
                    `}
                    title={`${emoji} tepkisi ekle`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Arrow */}
              <div className={`
                absolute bottom-0 left-4 transform translate-y-full
                w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent
                ${currentTheme.id === 'cyberpunk' 
                  ? 'border-t-cyber-primary/30' 
                  : 'border-t-gray-200'
                }
              `}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;