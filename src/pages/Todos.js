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
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { CheckSquare, Plus, Edit, Save, X, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Todos() {
  const { currentUser } = useAuth();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="text-center">
        <h1 className="text-4xl font-romantic text-gray-800 mb-2 flex items-center justify-center">
          <CheckSquare className="w-8 h-8 mr-3" />
          Birlikte Yapılacaklar
        </h1>
        <p className="text-lg text-gray-700 font-elegant">
          Birlikte planladığınız şeyler burada...
        </p>
      </div>

      {/* Yeni Yapılacak Butonu */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-love-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yapılacak Ekle</span>
        </button>
      </div>

      {/* Yapılacak Formu */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
          <h2 className="text-2xl font-romantic text-gray-800 mb-6">
            {editingTodo ? 'Yapılacağı Düzenle' : 'Yeni Yapılacak Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 text-gray-800"
                placeholder="Yapılacak başlığı..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Açıklama (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 resize-none text-gray-800"
                placeholder="Detaylar..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="form-checkbox h-5 w-5 text-romantic-500"
                id="completed"
              />
              <label htmlFor="completed" className="text-gray-800 font-medium">
                Tamamlandı
              </label>
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
          <h2 className="text-xl sm:text-2xl font-romantic text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2 animate-wiggle">📝</span>
            Yapılacaklar ({todos.length})
          </h2>
          
          {todos.length === 0 ? (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-romantic-100">
              <CheckSquare className="w-12 h-12 text-romantic-300 mx-auto mb-3" />
              <p className="text-gray-600">Henüz yapılacak yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-romantic-100 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 flex-1">
                      {todo.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(todo)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {todo.description && (
                    <p className="text-gray-700 text-sm mb-2">{todo.description}</p>
                  )}
                  
                  <p className="text-xs text-gray-600">{todo.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tamamlananlar */}
        <div>
          <h2 className="text-xl sm:text-2xl font-romantic text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2 animate-bounce-love">✅</span>
            Tamamlananlar ({completedTodos.length})
          </h2>
          
          {completedTodos.length === 0 ? (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-romantic-100">
              <CheckSquare className="w-12 h-12 text-romantic-300 mx-auto mb-3" />
              <p className="text-gray-600">Henüz tamamlanan yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-green-50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-green-200 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-green-800 flex-1 line-through">
                      {todo.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(todo)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                        title="Yapılacaklara geri al"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {todo.description && (
                    <p className="text-green-700 text-sm mb-2 line-through opacity-75">
                      {todo.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-green-600">{todo.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
