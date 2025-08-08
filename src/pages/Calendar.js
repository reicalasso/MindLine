import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, Plus, Edit, Trash2, Save, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    note: '',
    category: 'anniversary'
  });

  const categories = [
    { key: 'anniversary', label: 'Yıldönümü', color: 'bg-red-100 text-red-700', icon: '💕' },
    { key: 'date', label: 'Buluşma', color: 'bg-pink-100 text-pink-700', icon: '💖' },
    { key: 'memory', label: 'Özel Anı', color: 'bg-purple-100 text-purple-700', icon: '✨' },
    { key: 'future', label: 'Gelecek Plan', color: 'bg-blue-100 text-blue-700', icon: '🎯' },
    { key: 'other', label: 'Diğer', color: 'bg-gray-100 text-gray-700', icon: '📝' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'calendar'),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
      toast.error('Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      toast.error('Başlık ve tarih boş bırakılamaz');
      return;
    }

    try {
      const eventData = {
        title: formData.title.trim(),
        date: new Date(formData.date),
        note: formData.note.trim(),
        category: formData.category,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'calendar', editingEvent.id), {
          ...eventData,
          createdAt: editingEvent.createdAt
        });
        toast.success('Etkinlik güncellendi! 📅');
      } else {
        await addDoc(collection(db, 'calendar'), eventData);
        toast.success('Etkinlik eklendi! 📅');
      }

      setFormData({ title: '', date: '', note: '', category: 'anniversary' });
      setShowForm(false);
      setEditingEvent(null);
      setSelectedDate(null);
      fetchEvents();
    } catch (error) {
      console.error('Etkinlik kaydedilirken hata:', error);
      toast.error('Etkinlik kaydedilemedi');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date?.toDate?.()?.toISOString().split('T')[0] || '',
      note: event.note,
      category: event.category
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'calendar', eventId));
        toast.success('Etkinlik silindi');
        fetchEvents();
      } catch (error) {
        console.error('Etkinlik silinirken hata:', error);
        toast.error('Etkinlik silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', note: '', category: 'anniversary' });
    setShowForm(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Önceki ayın günleri
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Bu ayın günleri
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = event.date?.toDate?.() || new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setFormData({ 
      ...formData, 
      date: date.toISOString().split('T')[0] 
    });
    setShowForm(true);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getCategoryInfo = (categoryKey) => {
    return categories.find(cat => cat.key === categoryKey) || categories[4];
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-[400px]"
        style={{ 
          backgroundColor: colors.background,
          backgroundImage: colors.backgroundGradient 
        }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  return (
    <div 
      className="space-y-8"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient,
        minHeight: '100vh',
        padding: '2rem 1rem'
      }}
    >
      {/* Başlık */}
      <div className="text-center">
        <h1 
          className={`text-4xl font-bold mb-2 flex items-center justify-center ${
            currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
          }`}
          style={{
            color: colors.text,
            fontFamily: currentTheme.typography.fontFamilyHeading
          }}
        >
          <Calendar className="w-8 h-8 mr-3" />
          {currentTheme.id === 'ocean' ? 'Okyanus Takvimi' : 
           currentTheme.id === 'cat' ? 'Anı Takvimi' :
           'Etkinlik Takvimi'}
        </h1>
        <p 
          className="text-lg font-elegant"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'ocean' ? 'Derin anılarınız ve gelecek planlarınız...' :
           currentTheme.id === 'cat' ? 'Özel günleriniz ve anılarınız burada...' :
           'Önemli tarihlerinizi takip edin...'}
        </p>
      </div>

      {/* Takvim Navigasyonu */}
      <div 
        className="backdrop-blur-sm rounded-xl p-6 shadow-lg border"
        style={{
          backgroundColor: colors.surface + '80',
          borderColor: colors.border,
          boxShadow: `0 20px 60px ${colors.shadow}30`
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg transition-colors hover:shadow-md"
            style={{
              color: colors.primary,
              backgroundColor: colors.primary + '10',
              borderColor: colors.primary + '20'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 
            className={`text-2xl font-bold ${
              currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
            }`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg transition-colors hover:shadow-md"
            style={{
              color: colors.primary,
              backgroundColor: colors.primary + '10',
              borderColor: colors.primary + '20'
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div 
              key={day} 
              className="text-center text-sm font-medium py-2"
              style={{
                color: colors.textMuted,
                fontFamily: currentTheme.typography.fontFamily
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors ${
                  date 
                    ? 'hover:shadow-md' 
                    : 'cursor-default'
                } ${isToday ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: date 
                    ? colors.surface 
                    : colors.surface + '30',
                  borderColor: date 
                    ? colors.border 
                    : colors.border + '30',
                  ringColor: isToday ? colors.primary : 'transparent'
                }}
              >
                {date && (
                  <>
                    <div 
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'font-bold' : ''
                      }`}
                      style={{
                        color: isToday ? colors.primary : colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, idx) => {
                        const categoryInfo = getCategoryInfo(event.category);
                        return (
                          <div
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded truncate ${categoryInfo.color}`}
                            title={event.title}
                          >
                            {categoryInfo.icon} {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div 
                          className="text-xs"
                          style={{
                            color: colors.textMuted,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          +{dayEvents.length - 2} daha
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Etkinlik Formu */}
      {showForm && (
        <div 
          className="backdrop-blur-sm rounded-xl p-6 shadow-lg border max-w-2xl mx-auto"
          style={{
            backgroundColor: colors.surface + 'E6',
            borderColor: colors.border,
            boxShadow: `0 20px 60px ${colors.shadow}30`
          }}
        >
          <h2 
            className={`text-2xl font-bold mb-6`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            {editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                style={{
                  backgroundColor: colors.surface + '80',
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily,
                  '--tw-ring-color': colors.primary,
                }}
                placeholder="Özel gün başlığı..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
                  Tarih
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border,
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily,
                    '--tw-ring-color': colors.primary,
                  }}
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border,
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily,
                    '--tw-ring-color': colors.primary,
                  }}
                >
                  {categories.map(category => (
                    <option key={category.key} value={category.key}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Not (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm resize-none"
                style={{
                  backgroundColor: colors.surface + '80',
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily,
                  '--tw-ring-color': colors.primary,
                }}
                placeholder="Bu özel gün hakkında notlarınız..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:shadow-lg transition-colors flex items-center space-x-1"
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  backgroundColor: colors.surface
                }}
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-1"
                style={{
                  background: colors.primaryGradient,
                  color: 'white'
                }}
              >
                <Save className="w-4 h-4" />
                <span>{editingEvent ? 'Güncelle' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Yaklaşan Etkinlikler */}
      <div 
        className="backdrop-blur-sm rounded-xl p-6 shadow-lg border"
        style={{
          backgroundColor: colors.surface + '80',
          borderColor: colors.border,
          boxShadow: `0 20px 60px ${colors.shadow}30`
        }}
      >
        <h3 
          className={`text-xl font-bold mb-4 ${
            currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
          }`}
          style={{
            color: colors.text,
            fontFamily: currentTheme.typography.fontFamilyHeading
          }}
        >
          Yaklaşan Özel Günler
        </h3>
        {events.filter(event => {
          const eventDate = event.date?.toDate?.() || new Date(event.date);
          return eventDate >= new Date();
        }).slice(0, 5).length > 0 ? (
          <div className="space-y-3">
            {events.filter(event => {
              const eventDate = event.date?.toDate?.() || new Date(event.date);
              return eventDate >= new Date();
            }).slice(0, 5).map((event) => {
              const categoryInfo = getCategoryInfo(event.category);
              const eventDate = event.date?.toDate?.() || new Date(event.date);
              
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg group"
                  style={{
                    backgroundColor: colors.surfaceVariant
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <div>
                      <h4 
                        className="font-medium"
                        style={{
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamilyHeading
                        }}
                      >
                        {event.title}
                      </h4>
                      <p 
                        className="text-sm"
                        style={{
                          color: colors.textSecondary,
                          fontFamily: currentTheme.typography.fontFamily
                        }}
                      >
                        {eventDate.toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1 rounded hover:shadow-sm"
                      style={{ 
                        color: colors.info,
                        backgroundColor: colors.info + '10'
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 rounded hover:shadow-sm"
                      style={{ 
                        color: colors.error,
                        backgroundColor: colors.error + '10'
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p 
            className="text-center py-4"
            style={{
              color: colors.textMuted,
              fontFamily: currentTheme.typography.fontFamily
            }}
          >
            Yaklaşan özel gün yok
          </p>
        )}
      </div>
    </div>
  );
}
