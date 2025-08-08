import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
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
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
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
    status: 'watchlist',
    year: '',
    rating: '',
    watchDate: new Date().toISOString().split('T')[0],
    notes: '',
    folderId: null
  });
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, [activeTab, selectedFolder]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      // Tüm kullanıcıların filmlerini al - ortak kullanım için
      const snapshot = await getDocs(query(
        collection(db, 'movies'),
        orderBy('createdAt', 'desc')
      ));
      // Veriyi al, activeTab'a göre filtrele
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
        note: formData.notes.trim(), // notes alanını note olarak kaydet
        date: new Date(formData.watchDate || formData.date),
        status: activeTab, // Aktif tab'ı status olarak kullan
        year: formData.year,
        rating: formData.rating,
        folderId: formData.folderId,
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
        status: activeTab,
        year: '',
        rating: '',
        watchDate: new Date().toISOString().split('T')[0],
        notes: '',
        folderId: selectedFolder
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
      posterUrl: movie.posterUrl || '',
      note: movie.note || '',
      date: movie.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: movie.status,
      year: movie.year || '',
      rating: movie.rating || '',
      watchDate: movie.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      notes: movie.note || '',
      folderId: movie.folderId || null
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
      status: activeTab,
      year: '',
      rating: '',
      watchDate: new Date().toISOString().split('T')[0],
      notes: '',
      folderId: selectedFolder
    });
    setShowForm(false);
    setEditingMovie(null);
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
          className={`text-4xl mb-2 flex items-center justify-center ${
            currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
          }`}
          style={{
            color: colors.text,
            fontFamily: currentTheme.typography.fontFamilyHeading
          }}
        >
          <Film className="w-8 h-8 mr-3" />
          {currentTheme.id === 'skull-bunny' ? 'Dark Cinema' :
           currentTheme.id === 'ocean' ? 'Sinema Koleksiyonu' :
           currentTheme.id === 'cat' ? 'Film Koleksiyonu' :
           'Film Arşivim'}
        </h1>
        <p 
          className="text-lg"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'skull-bunny' ? 'Karanlık sinema dünyasının kayıtları...' :
           currentTheme.id === 'ocean' ? 'Okyanus derinliklerindeki film hazineleriniz...' :
           currentTheme.id === 'cat' ? 'Birlikte izlediğiniz güzel filmler burada...' :
           'Film koleksiyonunuz...'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Klasör Sidebar */}
        <div className="md:col-span-1">
          <div 
            className="backdrop-blur-sm rounded-xl p-4 shadow-lg border"
            style={{
              backgroundColor: colors.surface + '90',
              borderColor: colors.border
            }}
          >
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
              className="w-full px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
              style={{
                background: colors.primaryGradient,
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Film Ekle</span>
            </button>
          </div>
        </div>

        {/* Filmler İçeriği */}
        <div className="md:col-span-3">
          {/* Tab Navigation */}
          <div 
            className="backdrop-blur-sm rounded-xl p-1 shadow-lg border mb-6"
            style={{
              backgroundColor: colors.surface + '90',
              borderColor: colors.border
            }}
          >
            <div className="flex space-x-1">
              {LIST_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveTab(type.key)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === type.key
                      ? 'shadow-md'
                      : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === type.key ? colors.primary : 'transparent',
                    color: activeTab === type.key ? 'white' : colors.textSecondary,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Film Formu */}
          {showForm && (
            <div 
              className="backdrop-blur-sm rounded-xl p-6 shadow-lg border mb-8"
              style={{
                backgroundColor: colors.surface + '90',
                borderColor: colors.border
              }}
            >
              <h2 
                className={`text-2xl mb-6 ${
                  currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                }`}
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamilyHeading
                }}
              >
                {editingMovie ? 'Filmi Düzenle' : 'Yeni Film Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      Film Adı
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
                      placeholder="Film adını girin..."
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
                      Yıl
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                      style={{
                        backgroundColor: colors.surface + '50',
                        borderColor: colors.border,
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                      placeholder="2024"
                    />
                  </div>
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
                      İzlenme Tarihi
                    </label>
                    <div className="relative">
                      <Calendar 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: colors.textSecondary }}
                      />
                      <input
                        type="date"
                        value={formData.watchDate}
                        onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                        style={{
                          backgroundColor: colors.surface + '50',
                          borderColor: colors.border,
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamily
                        }}
                      />
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
                      Puanınız
                    </label>
                    <div className="relative">
                      <Star 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: colors.textSecondary }}
                      />
                      <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                        style={{
                          backgroundColor: colors.surface + '50',
                          borderColor: colors.border,
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamily
                        }}
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
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    Klasör (İsteğe Bağlı)
                  </label>
                  <div className="relative">
                    <FolderPlus 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                      style={{ color: colors.textSecondary }}
                    />
                    <select
                      value={formData.folderId || ''}
                      onChange={(e) => setFormData({ ...formData, folderId: e.target.value || null })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                      style={{
                        backgroundColor: colors.surface + '50',
                        borderColor: colors.border,
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      <option value="">Klasör Seçin (İsteğe Bağlı)</option>
                      <FolderOptions collectionName="movies" />
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
                    Notlarınız (İsteğe Bağlı)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm resize-none"
                    style={{
                      backgroundColor: colors.surface + '50',
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                    placeholder="Film hakkında düşünceleriniz..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
                    style={{
                      borderColor: colors.border,
                      color: colors.textSecondary
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
                    <span>{editingMovie ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filmler Listesi */}
          {movies.length === 0 ? (
            <div 
              className="text-center py-12 backdrop-blur-sm rounded-xl shadow-lg border"
              style={{
                backgroundColor: colors.surface + '80',
                borderColor: colors.border
              }}
            >
              <Film 
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: colors.primary + '30' }}
              />
              <h3 
                className={`text-xl mb-2 ${
                  currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                }`}
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamilyHeading
                }}
              >
                {selectedFolder ? 'Bu klasörde henüz film yok' : 'Henüz film yok'}
              </h3>
              <p 
                style={{
                  color: colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
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
                className="mt-4 px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center space-x-2"
                style={{
                  background: colors.primaryGradient,
                  color: 'white'
                }}
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
                  className="backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border group"
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-xl mb-1"
                        style={{
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamilyHeading
                        }}
                      >
                        {movie.title}
                      </h3>
                      {movie.year && (
                        <p 
                          className="text-sm"
                          style={{
                            color: colors.textSecondary,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          ({movie.year})
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="p-1 rounded hover:shadow-sm"
                        style={{ 
                          color: colors.info,
                          backgroundColor: colors.info + '10'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
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

                  {movie.rating && (
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 fill-current mr-1" style={{ color: colors.warning }} />
                      <span 
                        className="text-sm font-medium"
                        style={{
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamily
                        }}
                      >
                        {movie.rating}/10
                      </span>
                    </div>
                  )}

                  {movie.notes && (
                    <p 
                      className="mb-4 text-sm line-clamp-3"
                      style={{
                        color: colors.textSecondary,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {movie.notes}
                    </p>
                  )}

                  <div 
                    className="flex justify-between items-center text-xs"
                    style={{
                      color: colors.textMuted,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
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
