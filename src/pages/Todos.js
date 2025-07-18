import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { CheckSquare, Plus, Edit, Save, X, Trash2 } from 'lucide-react';
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
    // eslint-disable-next-line
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
    } catch {
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
        toast.success('Yapılacak güncellendi');
      } else {
        await addDoc(collection(db, 'todos'), todoData);
        toast.success('Yapılacak eklendi');
      }
      setFormData({ title: '', description: '', completed: false });
      setShowForm(false);
      setEditingTodo(null);
      fetchTodos();
    } catch {
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
      fetchTodos();
    } catch {
      toast.error('Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', completed: false });
    setShowForm(false);
    setEditingTodo(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-romantic text-romantic-700 mb-2 flex items-center justify-center">
          <CheckSquare className="w-8 h-8 mr-3" />
          Birlikte Yapılacaklar
        </h1>
        <p className="text-lg text-romantic-600 font-elegant">
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
          <h2 className="text-2xl font-romantic text-romantic-700 mb-6">
            {editingTodo ? 'Yapılacak Düzenle' : 'Yeni Yapılacak Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                placeholder="Yapılacak başlığı..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Açıklama
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                placeholder="Detay..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={e => setFormData({ ...formData, completed: e.target.checked })}
                className="form-checkbox h-5 w-5 text-romantic-500"
                id="completed"
              />
              <label htmlFor="completed" className="text-romantic-700 font-medium">
                Gerçekleşti
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

      {/* Yapılacaklar Listesi */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-romantic text-romantic-700 mb-4">Yapılacaklar</h2>
            {todos.length === 0 ? (
              <div className="text-center py-6 text-romantic-500">Henüz yapılacak yok</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-romantic-100 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-romantic-700 flex-1">
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
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm">{todo.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-romantic text-romantic-700 mb-4">Tamamlananlar</h2>
            {completedTodos.length === 0 ? (
              <div className="text-center py-6 text-romantic-500">Henüz tamamlanan yok</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTodos.map(todo => (
                  <div
                    key={todo.id}
                    className="bg-green-50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-200 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-green-700 flex-1">
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
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm">{todo.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
