import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  orderBy, 
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Film,
  Calendar,
  Star,
  FolderPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import FolderManager from '../components/FolderManager';

const LIST_TYPES = [
  { key: 'watchlist', label: 'İzleyeceklerimiz' },
  { key: 'watched', label: 'İzlediklerimiz' },
  { key: 'dropped', label: 'Yarıda Bıraktıklarımız' }
];

export default function Movies() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('watchlist');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    posterUrl: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    status: 'watchlist'
  });
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, [activeTab, selectedFolder]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      // Sadece kullanıcının filmlerini al - index gerektirmeyen basit query
      const snapshot = await getDocs(query(
        collection(db, 'movies'),
        where('author', '==', currentUser?.uid || '')
      ));
      // Veriyi al, activeTab'a göre filtrele ve tarih bazlı sırala
      const allMovies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering - aktif tab'a göre filtrele
      const filteredMovies = allMovies.filter(movie => movie.status === activeTab);

      // Client-side sorting - tarihe göre sırala
      filteredMovies.sort((a, b) => {
        const aDate = a.date?.toDate?.() || new Date(0);
        const bDate = b.date?.toDate?.() || new Date(0);
        return bDate - aDate;
      });

      setMovies(filteredMovies);
    } catch (error) {
      console.error('Filmler yüklenirken hata:', error);
      toast.error('Filmler yüklenemedi: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Film başlığı boş olamaz');
      return;
    }
    try {
      const movieData = {
        title: formData.title.trim(),
        posterUrl: formData.posterUrl.trim(),
        note: formData.note.trim(),
        date: new Date(formData.date),
        status: formData.status,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      if (editingMovie) {
        await updateDoc(doc(db, 'movies', editingMovie.id), {
          ...movieData,
          createdAt: editingMovie.createdAt
        });
        toast.success('Film güncellendi');
      } else {
        await addDoc(collection(db, 'movies'), movieData);
        toast.success('Film eklendi');
      }
      setFormData({
        title: '',
        posterUrl: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        status: activeTab
      });
      setShowForm(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (error) {
      toast.error('Film kaydedilemedi');
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      posterUrl: movie.posterUrl,
      note: movie.note,
      date: movie.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: movie.status
    });
    setShowForm(true);
  };

  const handleDelete = async (movieId) => {
    if (window.confirm('Bu filmi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'movies', movieId));
        toast.success('Film silindi');
        fetchMovies();
      } catch {
        toast.error('Film silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      posterUrl: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      status: activeTab
    });
    setShowForm(false);
    setEditingMovie(null);
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
        <h1 className="text-4xl font-romantic text-romantic-700 mb-2 flex items-center justify-center">
          <Film className="w-8 h-8 mr-3" />
          Film Koleksiyonu
        </h1>
        <p className="text-lg text-romantic-600 font-elegant">
          Birlikte izlediğiniz güzel filmler burada...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Klasör Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-romantic-200">
            <FolderManager 
              collectionName="movies" 
              onSelectFolder={setSelectedFolder} 
              selectedFolder={selectedFolder}
            />
            
            {/* Yeni Film Butonu */}
            <button
              onClick={() => {
                setFormData({ 
                  ...formData, 
                  folderId: selectedFolder 
                });
                setShowForm(true);
              }}
              className="w-full bg-love-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Film Ekle</span>
            </button>
          </div>
        </div>

        {/* Filmler İçeriği */}
        <div className="md:col-span-3">
          {/* Film Formu */}
          {showForm && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200 mb-8">
              <h2 className="text-2xl font-romantic text-romantic-700 mb-6">
                {editingMovie ? 'Filmi Düzenle' : 'Yeni Film Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-romantic-700 mb-2">
                      Film Adı
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                      placeholder="Film adını girin..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-romantic-700 mb-2">
                      Yıl
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-romantic-700 mb-2">
                      İzlenme Tarihi
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
                      <input
                        type="date"
                        value={formData.watchDate}
                        onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-romantic-700 mb-2">
                      Puanınız
                    </label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
                      <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                      >
                        <option value="">Puan seçin</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num}/10</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-700 mb-2">
                    Klasör (İsteğe Bağlı)
                  </label>
                  <div className="relative">
                    <FolderPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
                    <select
                      value={formData.folderId || ''}
                      onChange={(e) => setFormData({ ...formData, folderId: e.target.value || null })}
                      className="w-full pl-10 pr-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                    >
                      <option value="">Klasör Seçin (İsteğe Bağlı)</option>
                      <FolderOptions collectionName="movies" />
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-romantic-700 mb-2">
                    Notlarınız (İsteğe Bağlı)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 resize-none"
                    placeholder="Film hakkında düşünceleriniz..."
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
                    <span>{editingMovie ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filmler Listesi */}
          {movies.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-romantic-100">
              <Film className="w-16 h-16 text-romantic-300 mx-auto mb-4" />
              <h3 className="text-xl font-romantic text-romantic-600 mb-2">
                {selectedFolder ? 'Bu klasörde henüz film yok' : 'Henüz film yok'}
              </h3>
              <p className="text-romantic-500">
                {selectedFolder ? 'Bu klasöre ilk filminizi ekleyin!' : 'İlk filminizi eklemeye ne dersiniz?'}
              </p>
              <button
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    folderId: selectedFolder 
                  });
                  setShowForm(true);
                }}
                className="mt-4 bg-love-gradient text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Film</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-romantic-100 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-romantic-700 mb-1">
                        {movie.title}
                      </h3>
                      {movie.year && (
                        <p className="text-sm text-romantic-500">({movie.year})</p>
                      )}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {movie.rating && (
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-700">
                        {movie.rating}/10
                      </span>
                    </div>
                  )}

                  {movie.notes && (
                    <p className="text-gray-700 mb-4 text-sm line-clamp-3">
                      {movie.notes}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-romantic-500">
                    <span>{movie.author}</span>
                    <span>
                      {movie.watchDate?.toDate?.()?.toLocaleDateString('tr-TR') || 
                       movie.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || 
                       'Tarih yok'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FolderOptions({ collectionName }) {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const foldersCol = collection(db, `${collectionName}Folders`);
        const folderSnapshot = await getDocs(foldersCol);
        const folderList = folderSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setFolders(folderList);
      } catch (error) {
        console.error('Klasörler yüklenirken hata:', error);
      }
    };

    fetchFolders();
  }, [collectionName]);

  return (
    <>
      {folders.length === 0 ? (
        <option value="">Henüz klasör yok</option>
      ) : (
        folders.map(folder => (
          <option key={folder.id} value={folder.id}>{folder.name}</option>
        ))
      )}
    </>
  );
}
