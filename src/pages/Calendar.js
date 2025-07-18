import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
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
    <div className="space-y-8">
      {/* Başlık */}
      <div className="text-center">
        <h1 className="text-4xl font-romantic text-romantic-700 mb-2 flex items-center justify-center">
          <Calendar className="w-8 h-8 mr-3" />
          Anı Takvimi
        </h1>
        <p className="text-lg text-romantic-600 font-elegant">
          Özel günleriniz ve anılarınız burada...
        </p>
      </div>

      {/* Takvim Navigasyonu */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 text-romantic-600 hover:bg-romantic-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-romantic text-romantic-700">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 text-romantic-600 hover:bg-romantic-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
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
                    ? 'bg-white hover:bg-romantic-50 border-romantic-200' 
                    : 'bg-gray-50 border-gray-200 cursor-default'
                } ${isToday ? 'ring-2 ring-romantic-500' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-romantic-700' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, idx) => {
                        const categoryInfo = getCategoryInfo(event.category);
                        return (
                          <div
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded ${categoryInfo.color} truncate`}
                            title={event.title}
                          >
                            {categoryInfo.icon} {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
          <h2 className="text-2xl font-romantic text-romantic-700 mb-6">
            {editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                placeholder="Özel gün başlığı..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
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
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Not (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 resize-none"
                placeholder="Bu özel gün hakkında notlarınız..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-love-gradient text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>{editingEvent ? 'Güncelle' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Yaklaşan Etkinlikler */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
        <h3 className="text-xl font-romantic text-romantic-700 mb-4">
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
                  className="flex items-center justify-between p-3 bg-romantic-50 rounded-lg group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <div>
                      <h4 className="font-medium text-romantic-700">{event.title}</h4>
                      <p className="text-sm text-gray-600">
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
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Yaklaşan özel gün yok
          </p>
        )}
      </div>
    </div>
  );
}
