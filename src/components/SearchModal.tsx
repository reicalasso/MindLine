import React, { useState, useMemo } from 'react';
import { Search, Filter, X, FileText, MessageSquare, Image, Film, Music, CheckSquare, Heart } from 'lucide-react';
import { SearchResult, SearchFilters } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Timestamp } from 'firebase/firestore';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToResult?: (result: SearchResult) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToResult
}) => {
  const { currentTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const mockResults: SearchResult[] = useMemo(() => [
    {
      id: '1',
      type: 'letter',
      title: 'İlk Aşk Mektubum',
      content: 'Sevgili canım, bu mektup ile...',
      snippet: 'Sevgili canım, bu mektup ile sana olan aşkımı anlatmak istiyorum...',
      score: 0.95,
      dateCreated: new Date() as unknown as Timestamp,
      author: 'Benim'
    },
    {
      id: '2',
      type: 'message',
      title: 'Sohbet Mesajı',
      content: 'Ne yapıyorsun aşkım?',
      snippet: 'Ne yapıyorsun aşkım? Bugün çok güzel bir gün...',
      score: 0.85,
      dateCreated: new Date() as unknown as Timestamp,
      author: 'Partner'
    }
  ], []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    return mockResults.filter(result => {
      // Filter by query
      const matchesQuery = 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.snippet.toLowerCase().includes(query.toLowerCase());

      // Filter by type
      const matchesType = !filters.types?.length || filters.types.includes(result.type);

      // Filter by author
      const matchesAuthor = !filters.author || result.author === filters.author;

      return matchesQuery && matchesType && matchesAuthor;
    }).sort((a, b) => b.score - a.score);
  }, [query, filters, mockResults]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'letter': return FileText;
      case 'message': return MessageSquare;
      case 'photo': return Image;
      case 'movie': return Film;
      case 'music': return Music;
      case 'todo': return CheckSquare;
      case 'mood': return Heart;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'letter': return 'Mektup';
      case 'message': return 'Mesaj';
      case 'photo': return 'Fotoğraf';
      case 'movie': return 'Film';
      case 'music': return 'Müzik';
      case 'todo': return 'Görev';
      case 'mood': return 'Mood';
      default: return 'İçerik';
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'letter': return 'text-blue-500';
      case 'message': return 'text-green-500';
      case 'photo': return 'text-purple-500';
      case 'movie': return 'text-red-500';
      case 'music': return 'text-orange-500';
      case 'todo': return 'text-indigo-500';
      case 'mood': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onNavigateToResult) {
      onNavigateToResult(result);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-w-3xl"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Search Header */}
        <div className="flex items-center gap-3 mb-6">
          <Search className={`w-6 h-6 ${currentTheme.colors.text}`} />
          <h2 className={`text-xl font-bold ${currentTheme.styles.textClass}`}>
            Arama
          </h2>
          <div className="ml-auto flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrele
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mektuplar, mesajlar, fotoğraflar ve diğer içeriklerde ara..."
            className={`
              w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all
              ${currentTheme.id === 'cyberpunk' 
                ? 'bg-gray-900 border-cyber-primary/30 focus:border-cyber-primary text-cyber-primary placeholder-cyber-secondary'
                : 'bg-white border-gray-200 focus:border-pink-300 text-gray-900 placeholder-gray-500'
              }
            `}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`p-4 rounded-lg border ${currentTheme.colors.border} ${currentTheme.colors.surface} space-y-4`}>
            <h3 className={`font-medium ${currentTheme.styles.textClass}`}>Filtreler</h3>
            
            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${currentTheme.styles.textClass}`}>
                İçerik Türü
              </label>
              <div className="flex flex-wrap gap-2">
                {(['letter', 'message', 'photo', 'movie', 'music', 'todo', 'mood'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const currentTypes = filters.types || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setFilters({ ...filters, types: newTypes });
                    }}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-all
                      ${filters.types?.includes(type)
                        ? `${getTypeColor(type)} bg-current bg-opacity-10 border-current border`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                      }
                    `}
                  >
                    {getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              onClick={() => setFilters({})}
              variant="outline"
              size="sm"
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="text-center py-12">
              <Search className={`w-12 h-12 mx-auto mb-4 ${currentTheme.colors.text} opacity-30`} />
              <p className={`${currentTheme.styles.textClass} opacity-60`}>
                Aramak istediğiniz içeriği yazın
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😿</div>
              <p className={`${currentTheme.styles.textClass} opacity-60`}>
                "{query}" için sonuç bulunamadı
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result) => {
                const Icon = getTypeIcon(result.type);
                const typeColor = getTypeColor(result.type);
                
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`
                      w-full p-4 text-left rounded-lg border transition-all hover:scale-[1.02]
                      ${currentTheme.id === 'cyberpunk'
                        ? 'bg-gray-900/50 border-cyber-primary/20 hover:border-cyber-primary/40'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-1 ${typeColor} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${currentTheme.styles.textClass} truncate`}>
                            {result.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${typeColor} bg-current bg-opacity-10`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className={`text-sm opacity-70 ${currentTheme.styles.textClass} line-clamp-2`}>
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-50">
                          <span>{result.author}</span>
                          <span>•</span>
                          <span>Az önce</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Tips */}
        {query.trim() === '' && (
          <div className={`p-4 rounded-lg ${
            currentTheme.id === 'cyberpunk' 
              ? 'bg-cyber-primary/10 border border-cyber-primary/20' 
              : 'bg-gray-50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-lg">💡</div>
              <div className={`text-sm ${currentTheme.styles.textClass}`}>
                <strong>Arama İpuçları:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Mektup içeriklerinde, mesajlarda ve başlıklarda arama yapabilirsiniz</li>
                  <li>• Ctrl+K tuşları ile hızlıca arama açabilirsiniz</li>
                  <li>• Filtreler ile aramanızı daraltabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchModal;