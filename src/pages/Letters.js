import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  Heart,
  Calendar,
  Mail,
  FolderPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import FolderManager from '../components/FolderManager';

export default function Letters() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    folderId: null
  });
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    fetchLetters();
  }, [selectedFolder]);

  const fetchLetters = async () => {
    try {
      // Mektuplar yükleniyor
      let lettersQuery;
      
      if (selectedFolder) {
        lettersQuery = query(
          collection(db, 'letters'),
          where('folderId', '==', selectedFolder)
          // orderBy('date', 'desc') // Bu satır birleşik index gerektiriyor, bu yüzden kaldırıldı.
        );
      } else {
        lettersQuery = query(
          collection(db, 'letters')
        );
      }
      
      const snapshot = await getDocs(lettersQuery);
      let lettersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sıralamayı istemci tarafında yap
      lettersData.sort((a, b) => {
        const dateA = a.date?.toDate?.() || 0;
        const dateB = b.date?.toDate?.() || 0;
        return dateB - dateA;
      });

      // Mektuplar başarıyla yüklendi
      setLetters(lettersData);
    } catch (error) {
      console.error('Mektuplar yüklenirken hata:', error);
      if (error.code === 'permission-denied') {
        toast.error('Veritabanına erişim izni yok. Firestore kurallarını kontrol edin.');
      } else if (error.code === 'unavailable') {
        toast.error('Veritabanı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
      } else {
        toast.error('Mektuplar yüklenemedi: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Başlık ve i��erik boş bırakılamaz');
      return;
    }

    try {
      // Mektup kaydediliyor
      const letterData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        date: new Date(formData.date),
        folderId: formData.folderId,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingLetter) {
        await updateDoc(doc(db, 'letters', editingLetter.id), {
          ...letterData,
          createdAt: editingLetter.createdAt
        });
        // Mektup güncellendi
        toast.success('Mektup güncellendi! 💕');
      } else {
        const docRef = await addDoc(collection(db, 'letters'), letterData);
        // Mektup eklendi
        toast.success('Mektup kaydedildi! 💕');
      }

      setFormData({ 
        title: '', 
        content: '', 
        date: new Date().toISOString().split('T')[0],
        folderId: null
      });
      setShowForm(false);
      setEditingLetter(null);
      fetchLetters();
    } catch (error) {
      console.error('Mektup kaydedilirken hata:', error);
      if (error.code === 'permission-denied') {
        toast.error('Veritabanına yazma izni yok. Firestore kurallarını kontrol edin.');
      } else {
        toast.error('Mektup kaydedilemedi: ' + error.message);
      }
    }
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setFormData({
      title: letter.title,
      content: letter.content,
      date: letter.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      folderId: letter.folderId || null
    });
    setShowForm(true);
  };

  const handleDelete = async (letterId) => {
    if (window.confirm('Bu mektubu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'letters', letterId));
        toast.success('Mektup silindi');
        fetchLetters();
      } catch (error) {
        console.error('Mektup silinirken hata:', error);
        toast.error('Mektup silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      content: '', 
      date: new Date().toISOString().split('T')[0],
      folderId: selectedFolder
    });
    setShowForm(false);
    setEditingLetter(null);
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
          <Mail className="w-8 h-8 mr-3" />
          Aşk Mektupları
        </h1>
        <p className="text-lg text-gray-700 font-elegant">
          Birbirinize yazdığınız güzel mektuplar burada...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Klasör Sidebar */}
        <div className="md:col-span-1">
          <div className={`${currentTheme.id === 'cyberpunk' ? 'bg-cyber-50/90 border-cyber-secondary shadow-cyber' : 'bg-white/90 border-romantic-200 shadow-lg'} backdrop-blur-sm rounded-xl p-4 border`}>
            <FolderManager 
              collectionName="letters" 
              onSelectFolder={setSelectedFolder} 
              selectedFolder={selectedFolder}
            />
            
            {/* Yeni Mektup Butonu */}
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
              <span>Yeni Mektup Yaz</span>
            </button>
          </div>
        </div>

        {/* Mektuplar İçeriği */}
        <div className="md:col-span-3">
          {/* Mektup Formu */}
          {showForm && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200 mb-8">
              <h2 className="text-2xl font-romantic text-gray-800 mb-6">
                {editingLetter ? 'Mektubu Düzenle' : 'Yeni Mektup Yaz'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Başlık (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 text-gray-800"
                    placeholder="Mektubunuza bir başlık verin..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Tarih
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 text-gray-800"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Klasör (İsteğe Bağlı)
                    </label>
                    <div className="relative">
                      <FolderPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <select
                        value={formData.folderId || ''}
                        onChange={(e) => setFormData({ ...formData, folderId: e.target.value || null })}
                        className="w-full pl-10 pr-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 text-gray-800"
                      >
                        <option value="">Klasör Seçin (İsteğe Bağlı)</option>
                        <FolderOptions collectionName="letters" />
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Mektup İçeriği
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 font-handwriting text-lg resize-none text-gray-800"
                    placeholder="Sevgili..."
                    required
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
                    <span>{editingLetter ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mektuplar Listesi */}
          {letters.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-romantic-100">
              <Heart className="w-16 h-16 text-romantic-300 mx-auto mb-4" />
              <h3 className="text-xl font-romantic text-gray-800 mb-2">
                {selectedFolder ? 'Bu klasörde henüz mektup yok' : 'Henüz mektup yok'}
              </h3>
              <p className="text-gray-700">
                {selectedFolder ? 'Bu klasöre ilk mektubunuzu ekleyin!' : 'İlk aşk mektubunuzu yazmaya ne dersiniz?'}
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
                <span>Yeni Mektup</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-romantic-100 group cursor-pointer"
                  onClick={() => setSelectedLetter(letter)}
                  style={{ minHeight: '220px', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-handwriting text-xl text-gray-800 flex-1">
                      {letter.title || 'Başlıksız Mektup'}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(letter);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(letter.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="text-gray-800 mb-4 font-handwriting text-sm overflow-y-auto"
                    style={{
                      maxHeight: '180px',
                      minHeight: '80px',
                      paddingRight: '4px',
                      wordBreak: 'break-word'
                    }}
                  >
                    {letter.content}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 mt-auto">
                    <span>{letter.author}</span>
                    <span>
                      {letter.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Mektup Görüntüleme Modalı */}
          {selectedLetter && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLetter(null)}>
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-romantic text-gray-800 mb-2">
                    {selectedLetter.title || 'Başlıksız Mektup'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedLetter.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {selectedLetter.author}
                  </p>
                </div>
                <div className="mb-6 overflow-y-auto" style={{ maxHeight: '320px', minHeight: '120px', paddingRight: '4px' }}>
                  <p className="font-handwriting text-lg text-gray-800 whitespace-pre-line">
                    {selectedLetter.content}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="px-4 py-2 bg-romantic-100 hover:bg-romantic-200 text-romantic-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Kapat</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Klasör seçenekleri için alt bileşen
function FolderOptions({ collectionName }) {
  const [folders, setFolders] = useState([]);
  
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const foldersQuery = query(
          collection(db, `folders_${collectionName}`),
          orderBy('name', 'asc')
        );
        const snapshot = await getDocs(foldersQuery);
        const foldersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFolders(foldersData);
      } catch (error) {
        console.error('Klasörler yüklenirken hata:', error);
      }
    };
    
    fetchFolders();
  }, [collectionName]);
  
  return (
    <>
      {folders.map(folder => (
        <option key={folder.id} value={folder.id}>
          {folder.name}
        </option>
      ))}
    </>
  );
}
