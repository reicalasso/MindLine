import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { CheckSquare, Plus, Edit, Save, X, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';

export default function Todos() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const todosQuery = query(
        collection(db, 'todos'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(todosQuery);
      const allTodos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTodos(allTodos.filter(todo => !todo.completed));
      setCompletedTodos(allTodos.filter(todo => todo.completed));
    } catch (error) {
      console.error('Yapılacaklar yüklenirken hata:', error);
      toast.error('Yapılacaklar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Başlık boş olamaz');
      return;
    }

    try {
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        completed: formData.completed,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingTodo) {
        await updateDoc(doc(db, 'todos', editingTodo.id), {
          ...todoData,
          createdAt: editingTodo.createdAt
        });
        toast.success('Yapılacak güncellendi! 📝');
      } else {
        await addDoc(collection(db, 'todos'), todoData);
        toast.success('Yapılacak eklendi! 📝');
      }

      setFormData({ title: '', description: '', completed: false });
      setShowForm(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Yapılacak kaydedilirken hata:', error);
      toast.error('Yapılacak kaydedilemedi');
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      completed: todo.completed
    });
    setShowForm(true);
  };

  const handleComplete = async (todo) => {
    try {
      await updateDoc(doc(db, 'todos', todo.id), {
        completed: !todo.completed,
        updatedAt: serverTimestamp()
      });
      toast.success(todo.completed ? 'Yapılacak listesine geri eklendi' : 'Tamamlandı! 🎉');
      fetchTodos();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDelete = async (todoId) => {
    if (window.confirm('Bu yapılacağı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'todos', todoId));
        toast.success('Yapılacak silindi');
        fetchTodos();
      } catch (error) {
        console.error('Yapılacak silinirken hata:', error);
        toast.error('Yapılacak silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', completed: false });
    setShowForm(false);
    setEditingTodo(null);
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
          <CheckSquare className="w-8 h-8 mr-3" />
          {currentTheme.id === 'ocean' ? 'Derin Planlarımız' : 
           currentTheme.id === 'cat' ? 'Birlikte Yapılacaklar' :
           'Görev Listem'}
        </h1>
        <p 
          className="text-lg font-elegant"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'ocean' ? 'Okyanus gibi derin planlarınız burada yüzüyor...' :
           currentTheme.id === 'cat' ? 'Birlikte planladığınız şeyler burada...' :
           'Hedeflerinizi takip edin...'}
        </p>
      </div>

      {/* Yeni Yapılacak Butonu */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className={`px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2 ${
            currentTheme.id === 'ocean' ? 'hover:animate-wave' : 
            currentTheme.id === 'cat' ? 'hover:animate-wiggle' : ''
          }`}
          style={{
            background: colors.primaryGradient,
            color: 'white',
            boxShadow: `0 8px 25px ${colors.primary}40`
          }}
        >
          <Plus className="w-5 h-5" />
          <span>Yapılacak Ekle</span>
        </button>
      </div>

      {/* Yapılacak Formu */}
      {showForm && (
        <div 
          className="backdrop-blur-sm rounded-xl p-6 shadow-lg border"
          style={{
            backgroundColor: colors.surface + '90',
            borderColor: colors.border,
            boxShadow: `0 20px 60px ${colors.shadow}30`
          }}
        >
          <h2 
            className={`text-2xl font-bold mb-6 ${
              currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
            }`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            {editingTodo ? 'Yapılacağı Düzenle' : 'Yeni Yapılacak Ekle'}
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
                  backgroundColor: colors.surface + '50',
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily
                }}
                placeholder="Yapılacak başlığı..."
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
                Açıklama (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm resize-none"
                style={{
                  backgroundColor: colors.surface + '50',
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily
                }}
                placeholder="Detaylar..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="form-checkbox h-5 w-5"
                style={{ 
                  accentColor: colors.primary,
                  color: colors.primary
                }}
                id="completed"
              />
              <label 
                htmlFor="completed" 
                className="font-medium"
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Tamamlandı
              </label>
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
                <span>{editingTodo ? 'Güncelle' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Yapılacaklar ve Tamamlananlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yapılacaklar */}
        <div>
          <h2 
            className={`text-xl sm:text-2xl font-bold mb-4 flex items-center ${
              currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
            }`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            <span 
              className={`text-2xl mr-2 ${
                currentTheme.id === 'cat' ? 'animate-wiggle' : 'animate-pulse'
              }`}
            >
              📝
            </span>
            Yapılacaklar ({todos.length})
          </h2>
          
          {todos.length === 0 ? (
            <div 
              className="text-center py-8 backdrop-blur-sm rounded-xl shadow-lg border"
              style={{
                backgroundColor: colors.surface + '80',
                borderColor: colors.border
              }}
            >
              <CheckSquare 
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: colors.primary + '30' }}
              />
              <p 
                style={{
                  color: colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Henüz yapılacak yok
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border group ${
                    currentTheme.id === 'ocean' ? 'hover:animate-wave' : 
                    currentTheme.id === 'cat' ? 'hover:animate-purr' : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border,
                    boxShadow: `0 8px 30px ${colors.shadow}20`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-semibold text-lg flex-1"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamilyHeading
                      }}
                    >
                      {todo.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-1 rounded hover:shadow-sm"
                        style={{ 
                          color: colors.info,
                          backgroundColor: colors.info + '10'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(todo)}
                        className="p-1 rounded hover:shadow-sm"
                        style={{ 
                          color: colors.success,
                          backgroundColor: colors.success + '10'
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
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
                  
                  {todo.description && (
                    <p 
                      className="text-sm mb-2"
                      style={{
                        color: colors.textSecondary,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {todo.description}
                    </p>
                  )}
                  
                  <p 
                    className="text-xs"
                    style={{
                      color: colors.textMuted,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {todo.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tamamlananlar */}
        <div>
          <h2 
            className={`text-xl sm:text-2xl font-bold mb-4 flex items-center ${
              currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
            }`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            <span 
              className={`text-2xl mr-2 ${
                currentTheme.id === 'cat' ? 'animate-bounce-love' : 'animate-bounce'
              }`}
            >
              ✅
            </span>
            Tamamlananlar ({completedTodos.length})
          </h2>
          
          {completedTodos.length === 0 ? (
            <div 
              className="text-center py-8 backdrop-blur-sm rounded-xl shadow-lg border"
              style={{
                backgroundColor: colors.surface + '80',
                borderColor: colors.border
              }}
            >
              <CheckSquare 
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: colors.primary + '30' }}
              />
              <p 
                style={{
                  color: colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Henüz tamamlanan yok
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="backdrop-blur-sm rounded-xl p-4 shadow-lg border group"
                  style={{
                    backgroundColor: colors.success + '10',
                    borderColor: colors.success + '30',
                    boxShadow: `0 8px 30px ${colors.success}20`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-semibold text-lg flex-1 line-through"
                      style={{
                        color: colors.success,
                        fontFamily: currentTheme.typography.fontFamilyHeading
                      }}
                    >
                      {todo.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-1 rounded hover:shadow-sm"
                        style={{ 
                          color: colors.info,
                          backgroundColor: colors.info + '10'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(todo)}
                        className="p-1 rounded hover:shadow-sm"
                        title="Yapılacaklara geri al"
                        style={{ 
                          color: colors.warning,
                          backgroundColor: colors.warning + '10'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
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
                  
                  {todo.description && (
                    <p 
                      className="text-sm mb-2 line-through opacity-75"
                      style={{
                        color: colors.success,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {todo.description}
                    </p>
                  )}
                  
                  <p 
                    className="text-xs"
                    style={{
                      color: colors.success,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {todo.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
