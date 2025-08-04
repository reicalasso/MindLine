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
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          currentTheme.id === 'cyberpunk' 
            ? 'border-cyber-primary' 
            : 'border-romantic-500'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="text-center">
        <h1 className={`text-4xl mb-2 flex items-center justify-center ${
          currentTheme.id === 'cyberpunk' 
            ? 'font-mono text-cyber-primary animate-neon-flicker' 
            : 'font-romantic text-gray-800'
        }`}>
          <Mail className="w-8 h-8 mr-3" />
          {currentTheme.id === 'cyberpunk' ? 'DATA_MAILS.exe' : 'Aşk Mektupları'}
        </h1>
        <p className={`text-lg ${
          currentTheme.id === 'cyberpunk' 
            ? 'text-cyber-secondary font-mono' 
            : 'text-gray-700 font-elegant'
        }`}>
          {currentTheme.id === 'cyberpunk' 
            ? 'Neural messages archived in quantum storage...' 
            : 'Birbirinize yazdığınız güzel mektuplar burada...'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Klasör Sidebar */}
        <div className="md:col-span-1">
          <div className={`${
            currentTheme.id === 'cyberpunk' 
              ? 'bg-cyber-50/90 border-cyber-secondary shadow-cyber animate-circuit-pulse' 
              : 'bg-white/90 border-romantic-200 shadow-lg'
          } backdrop-blur-sm rounded-xl p-4 border`}>
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
              className={`w-full px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 ${
                currentTheme.id === 'cyberpunk'
                  ? 'bg-cyber-red text-cyber-primary shadow-neon-red animate-cyber-glow'
                  : 'bg-love-gradient text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{currentTheme.id === 'cyberpunk' ? 'NEW_DATA_MAIL' : 'Yeni Mektup Yaz'}</span>
            </button>
          </div>
        </div>

        {/* Mektuplar İçeriği */}
        <div className="md:col-span-3">
          {/* Mektup Formu */}
          {showForm && (
            <div className={`backdrop-blur-sm rounded-xl p-6 shadow-lg border mb-8 ${
              currentTheme.id === 'cyberpunk'
                ? 'bg-cyber-50/90 border-cyber-secondary shadow-cyber animate-hologram'
                : 'bg-white/90 border-romantic-200'
            }`}>
              <h2 className={`text-2xl mb-6 ${
                currentTheme.id === 'cyberpunk'
                  ? 'font-mono text-cyber-primary animate-neon-flicker'
                  : 'font-romantic text-gray-800'
              }`}>
                {editingLetter 
                  ? (currentTheme.id === 'cyberpunk' ? 'EDIT_DATA_MAIL.exe' : 'Mektubu Düzenle')
                  : (currentTheme.id === 'cyberpunk' ? 'NEW_DATA_MAIL.exe' : 'Yeni Mektup Yaz')
                }
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    currentTheme.id === 'cyberpunk'
                      ? 'text-cyber-primary font-mono'
                      : 'text-gray-800'
                  }`}>
                    {currentTheme.id === 'cyberpunk' ? 'SUBJECT_LINE:' : 'Başlık (İsteğe Bağlı)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      currentTheme.id === 'cyberpunk'
                        ? 'cyber-input'
                        : 'border-romantic-200 focus:ring-romantic-500 bg-white/50 text-gray-800'
                    }`}
                    placeholder={currentTheme.id === 'cyberpunk' ? 'Enter subject line...' : 'Mektubunuza bir başlık verin...'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'text-cyber-primary font-mono'
                        : 'text-gray-800'
                    }`}>
                      {currentTheme.id === 'cyberpunk' ? 'TIMESTAMP:' : 'Tarih'}
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        currentTheme.id === 'cyberpunk' ? 'text-cyber-accent' : 'text-gray-500'
                      }`} />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                          currentTheme.id === 'cyberpunk'
                            ? 'cyber-input'
                            : 'border-romantic-200 focus:ring-romantic-500 bg-white/50 text-gray-800'
                        }`}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'text-cyber-primary font-mono'
                        : 'text-gray-800'
                    }`}>
                      {currentTheme.id === 'cyberpunk' ? 'FOLDER_ID:' : 'Klasör (İsteğe Bağlı)'}
                    </label>
                    <div className="relative">
                      <FolderPlus className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        currentTheme.id === 'cyberpunk' ? 'text-cyber-accent' : 'text-gray-500'
                      }`} />
                      <select
                        value={formData.folderId || ''}
                        onChange={(e) => setFormData({ ...formData, folderId: e.target.value || null })}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                          currentTheme.id === 'cyberpunk'
                            ? 'cyber-input'
                            : 'border-romantic-200 focus:ring-romantic-500 bg-white/50 text-gray-800'
                        }`}
                      >
                        <option value="">{currentTheme.id === 'cyberpunk' ? 'Select folder...' : 'Klasör Seçin (İsteğe Bağlı)'}</option>
                        <FolderOptions collectionName="letters" />
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    currentTheme.id === 'cyberpunk'
                      ? 'text-cyber-primary font-mono'
                      : 'text-gray-800'
                  }`}>
                    {currentTheme.id === 'cyberpunk' ? 'MESSAGE_CONTENT:' : 'Mektup İçeriği'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg resize-none ${
                      currentTheme.id === 'cyberpunk'
                        ? 'cyber-input font-mono'
                        : 'border-romantic-200 focus:ring-romantic-500 bg-white/50 font-handwriting text-gray-800'
                    }`}
                    placeholder={currentTheme.id === 'cyberpunk' ? 'Enter neural message...' : 'Sevgili...'}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2 border rounded-lg transition-colors flex items-center space-x-1 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'text-cyber-secondary hover:text-cyber-primary border-cyber-accent hover:bg-cyber-100'
                        : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>{currentTheme.id === 'cyberpunk' ? 'ABORT' : 'İptal'}</span>
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-1 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'bg-cyber-purple text-cyber-primary shadow-neon-purple animate-cyber-glow'
                        : 'bg-love-gradient text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingLetter ? (currentTheme.id === 'cyberpunk' ? 'UPDATE' : 'Güncelle') : (currentTheme.id === 'cyberpunk' ? 'SAVE' : 'Kaydet')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mektuplar Listesi */}
          {letters.length === 0 ? (
            <div className={`text-center py-12 backdrop-blur-sm rounded-xl shadow-lg border ${
              currentTheme.id === 'cyberpunk'
                ? 'bg-cyber-50/80 border-cyber-accent animate-hologram'
                : 'bg-white/80 border-romantic-100'
            }`}>
              <Heart className={`w-16 h-16 mx-auto mb-4 ${
                currentTheme.id === 'cyberpunk' ? 'text-cyber-accent animate-neon-flicker' : 'text-romantic-300'
              }`} />
              <h3 className={`text-xl mb-2 ${
                currentTheme.id === 'cyberpunk'
                  ? 'font-mono text-cyber-primary'
                  : 'font-romantic text-gray-800'
              }`}>
                {selectedFolder 
                  ? (currentTheme.id === 'cyberpunk' ? 'NO_DATA_IN_FOLDER' : 'Bu klasörde henüz mektup yok')
                  : (currentTheme.id === 'cyberpunk' ? 'NO_DATA_FOUND' : 'Henüz mektup yok')
                }
              </h3>
              <p className={currentTheme.id === 'cyberpunk' ? 'text-cyber-secondary font-mono' : 'text-gray-700'}>
                {selectedFolder 
                  ? (currentTheme.id === 'cyberpunk' ? 'Upload first data to this folder' : 'Bu klasöre ilk mektubunuzu ekleyin!')
                  : (currentTheme.id === 'cyberpunk' ? 'Initialize first neural message' : 'İlk aşk mektubunuzu yazmaya ne dersiniz?')
                }
              </p>
              <button
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    folderId: selectedFolder 
                  });
                  setShowForm(true);
                }}
                className={`mt-4 px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center space-x-2 ${
                  currentTheme.id === 'cyberpunk'
                    ? 'bg-cyber-red text-cyber-primary shadow-neon-red animate-cyber-glow'
                    : 'bg-love-gradient text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{currentTheme.id === 'cyberpunk' ? 'NEW_DATA_MAIL' : 'Yeni Mektup'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className={`backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border group cursor-pointer ${
                    currentTheme.id === 'cyberpunk'
                      ? 'bg-cyber-50/80 border-cyber-accent hover:border-cyber-primary animate-circuit-pulse hover:shadow-neon-blue'
                      : 'bg-white/80 border-romantic-100'
                  }`}
                  onClick={() => setSelectedLetter(letter)}
                  style={{ minHeight: '220px', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`flex-1 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'font-mono text-lg text-cyber-primary'
                        : 'font-handwriting text-xl text-gray-800'
                    }`}>
                      {letter.title || (currentTheme.id === 'cyberpunk' ? 'UNTITLED_DATA' : 'Başlıksız Mektup')}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(letter);
                        }}
                        className={`p-1 rounded ${
                          currentTheme.id === 'cyberpunk'
                            ? 'text-cyber-accent hover:bg-cyber-100 animate-neon-flicker'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(letter.id);
                        }}
                        className={`p-1 rounded ${
                          currentTheme.id === 'cyberpunk'
                            ? 'text-cyber-secondary hover:bg-cyber-100 animate-neon-flicker'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    className={`mb-4 text-sm overflow-y-auto ${
                      currentTheme.id === 'cyberpunk'
                        ? 'text-cyber-accent font-mono'
                        : 'text-gray-800 font-handwriting'
                    }`}
                    style={{
                      maxHeight: '180px',
                      minHeight: '80px',
                      paddingRight: '4px',
                      wordBreak: 'break-word'
                    }}
                  >
                    {letter.content}
                  </div>
                  <div className={`flex justify-between items-center text-xs mt-auto ${
                    currentTheme.id === 'cyberpunk'
                      ? 'text-cyber-secondary font-mono'
                      : 'text-gray-600'
                  }`}>
                    <span>{letter.author}</span>
                    <span>
                      {letter.date?.toDate?.()?.toLocaleDateString('tr-TR') || (currentTheme.id === 'cyberpunk' ? 'NO_TIMESTAMP' : 'Tarih yok')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Mektup Görüntüleme Modalı */}
          {selectedLetter && (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
              currentTheme.id === 'cyberpunk' ? 'bg-black/80' : 'bg-black/60'
            }`} onClick={() => setSelectedLetter(null)}>
              <div className={`rounded-3xl p-8 max-w-lg w-full shadow-2xl relative ${
                currentTheme.id === 'cyberpunk'
                  ? 'bg-cyber-50/95 border-2 border-cyber-primary shadow-neon-blue animate-hologram'
                  : 'bg-white'
              }`} onClick={e => e.stopPropagation()}>
                <div className="mb-6 text-center">
                  <h2 className={`text-2xl mb-2 ${
                    currentTheme.id === 'cyberpunk'
                      ? 'font-mono text-cyber-primary animate-neon-flicker'
                      : 'font-romantic text-gray-800'
                  }`}>
                    {selectedLetter.title || (currentTheme.id === 'cyberpunk' ? 'UNTITLED_DATA.msg' : 'Başlıksız Mektup')}
                  </h2>
                  <p className={`text-sm mb-2 ${
                    currentTheme.id === 'cyberpunk'
                      ? 'text-cyber-secondary font-mono'
                      : 'text-gray-500'
                  }`}>
                    {selectedLetter.date?.toDate?.()?.toLocaleDateString('tr-TR') || (currentTheme.id === 'cyberpunk' ? 'NO_TIMESTAMP' : 'Tarih yok')}
                  </p>
                  <p className={`text-xs mb-2 ${
                    currentTheme.id === 'cyberpunk'
                      ? 'text-cyber-accent font-mono'
                      : 'text-gray-400'
                  }`}>
                    {currentTheme.id === 'cyberpunk' ? `USER: ${selectedLetter.author}` : selectedLetter.author}
                  </p>
                </div>
                <div className="mb-6 overflow-y-auto" style={{ maxHeight: '320px', minHeight: '120px', paddingRight: '4px' }}>
                  <p className={`text-lg whitespace-pre-line ${
                    currentTheme.id === 'cyberpunk'
                      ? 'font-mono text-cyber-primary'
                      : 'font-handwriting text-gray-800'
                  }`}>
                    {selectedLetter.content}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      currentTheme.id === 'cyberpunk'
                        ? 'bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-primary border border-cyber-accent animate-circuit-pulse'
                        : 'bg-romantic-100 hover:bg-romantic-200 text-romantic-700'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>{currentTheme.id === 'cyberpunk' ? 'CLOSE' : 'Kapat'}</span>
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
export function FolderOptions({ collectionName }) {
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
