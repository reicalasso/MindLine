import React, { useState } from 'react';
import { Heart, Smile, Zap, Leaf, BookOpen } from 'lucide-react';
import { MoodEntry } from '../types';
import { Timestamp } from 'firebase/firestore';
import Button from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';

interface MoodTrackerProps {
  onMoodSave?: (mood: Partial<MoodEntry>) => void;
  className?: string;
}

const MOOD_OPTIONS = [
  { 
    value: 'happy' as const, 
    label: 'Mutlu', 
    emoji: '😊', 
    icon: Smile, 
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 hover:bg-yellow-100',
    description: 'Keyifli ve neşeli hissediyorum'
  },
  { 
    value: 'romantic' as const, 
    label: 'Romantik', 
    emoji: '💕', 
    icon: Heart, 
    color: 'text-pink-500',
    bg: 'bg-pink-50 hover:bg-pink-100',
    description: 'Aşık ve sevgi dolu hissediyorum'
  },
  { 
    value: 'excited' as const, 
    label: 'Heyecanlı', 
    emoji: '⚡', 
    icon: Zap, 
    color: 'text-orange-500',
    bg: 'bg-orange-50 hover:bg-orange-100',
    description: 'Enerjik ve coşkulu hissediyorum'
  },
  { 
    value: 'calm' as const, 
    label: 'Sakin', 
    emoji: '🍃', 
    icon: Leaf, 
    color: 'text-green-500',
    bg: 'bg-green-50 hover:bg-green-100',
    description: 'Huzurlu ve rahat hissediyorum'
  },
  { 
    value: 'thoughtful' as const, 
    label: 'Düşünceli', 
    emoji: '🤔', 
    icon: BookOpen, 
    color: 'text-purple-500',
    bg: 'bg-purple-50 hover:bg-purple-100',
    description: 'Derin düşüncelere dalmış hissediyorum'
  }
];

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSave, className = '' }) => {
  const { currentTheme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMoodSelect = (mood: MoodEntry['mood']) => {
    setSelectedMood(mood);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSave = () => {
    if (selectedMood && onMoodSave) {
      onMoodSave({
        mood: selectedMood,
        note: note.trim() || undefined,
        energy,
        date: new Date() as unknown as Timestamp // Will be converted to Timestamp in the backend
      });
      
      // Reset form
      setSelectedMood(null);
      setNote('');
      setEnergy(5);
      setIsExpanded(false);
    }
  };

  const selectedMoodOption = MOOD_OPTIONS.find(option => option.value === selectedMood);

  return (
    <div className={`${className} p-4 rounded-xl border-2 ${currentTheme.colors.border} ${currentTheme.colors.surface} transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-2xl ${currentTheme.id === 'cyberpunk' ? 'animate-neon-flicker-lite' : 'animate-bounce-cat'}`}>
          😺
        </div>
        <h3 className={`text-lg font-semibold ${currentTheme.styles.textClass}`}>
          Bugün nasıl hissediyorsun?
        </h3>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {MOOD_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMood === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleMoodSelect(option.value)}
              className={`
                p-3 rounded-xl text-center transition-all duration-200 group
                ${isSelected ? `${option.bg} ring-2 ring-current ${option.color} scale-105` : `${option.bg} hover:scale-105`}
                ${currentTheme.id === 'cyberpunk' ? 'hover:animate-pulse' : ''}
              `}
              title={option.description}
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {option.emoji}
              </div>
              <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? option.color : 'text-gray-400'} transition-colors`} />
              <div className={`text-xs font-medium ${isSelected ? option.color : 'text-gray-600'} transition-colors`}>
                {option.label}
              </div>
            </button>
          );
        })}
      </div>

      {isExpanded && selectedMoodOption && (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <div className="text-xl">{selectedMoodOption.emoji}</div>
            <div>
              <div className={`font-medium ${selectedMoodOption.color}`}>
                {selectedMoodOption.label} hissediyorum
              </div>
              <div className="text-sm text-gray-600">
                {selectedMoodOption.description}
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme.styles.textClass}`}>
              Enerji Seviyesi: {energy}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${currentTheme.id === 'cyberpunk' ? 'cyber-slider' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Düşük</span>
              <span>Yüksek</span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme.styles.textClass}`}>
              Not (isteğe bağlı)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bu ruh halini yaşama neden olan şeyler hakkında not ekle..."
              rows={3}
              className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-current ${selectedMoodOption.color} focus:border-transparent transition-all ${currentTheme.colors.surface}`}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {note.length}/200
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
            >
              Mood'u Kaydet
            </Button>
            <Button
              onClick={() => {
                setIsExpanded(false);
                setSelectedMood(null);
                setNote('');
                setEnergy(5);
              }}
              variant="outline"
            >
              İptal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;