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
  const colors = useThemeColors();
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
      className="space-y-8 page-content ios-bottom-fix"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient,
        minHeight: '100vh',
        padding: '2rem 1rem',
        paddingBottom: 'calc(var(--safe-area-inset-bottom, 0px) + 2rem)'
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
          <Mail className="w-8 h-8 mr-3" />
          {currentTheme.id === 'skull-bunny' ? 'Dark Letters' :
           currentTheme.id === 'ocean' ? 'Okyanus Mektupları' :
           currentTheme.id === 'cat' ? 'Aşk Mektupları' :
           'Mektuplarım'}
        </h1>
        <p 
          className="text-lg"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'skull-bunny' ? 'Karanlık düşüncelerinizin yazılı hali...' :
           currentTheme.id === 'ocean' ? 'Derin duygularınızın yazdığınız mektuplar...' :
           currentTheme.id === 'cat' ? 'Birbirinize yazdığınız güzel mektuplar burada...' :
           'Özel mektuplarınız burada...'}
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
                currentTheme.id === 'skull-bunny' ? 'hover:animate-flicker' :
                currentTheme.id === 'ocean' ? 'hover:animate-wave' :
                currentTheme.id === 'cat' ? 'hover:animate-wiggle' : ''
              }`}
              style={{
                background: colors.primaryGradient,
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              <span>
                {currentTheme.id === 'skull-bunny' ? 'New Dark Letter' :
                 currentTheme.id === 'ocean' ? 'Yeni Deniz Mektubu' :
                 currentTheme.id === 'cat' ? 'Yeni Mektup Yaz' :
                 'Yeni Mektup'}
              </span>
            </button>
          </div>
        </div>

        {/* Mektuplar İçeriği */}
        <div className="md:col-span-3">
          {/* Mektup Formu */}
          {showForm && (
            <div 
              className="backdrop-blur-sm rounded-xl p-6 shadow-lg border mb-8"
              style={{
                backgroundColor: colors.surface + '90',
                borderColor: colors.border,
                boxShadow: `0 20px 60px ${colors.shadow}30`
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
                {editingLetter 
                  ? (currentTheme.id === 'skull-bunny' ? 'Edit Dark Letter' : 'Mektubu Düzenle')
                  : (currentTheme.id === 'skull-bunny' ? 'New Dark Letter' : 'Yeni Mektup Yaz')
                }
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
                    Başlık (İsteğe Bağlı)
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
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder="Mektubunuza bir başlık verin..."
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
                    <div className="relative">
                      <Calendar 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: colors.textSecondary }}
                      />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                        style={{
                          backgroundColor: colors.surface + '80',
                          borderColor: colors.border,
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamily,
                          '--tw-ring-color': colors.primary
                        }}
                        required
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
                          backgroundColor: colors.surface + '80',
                          borderColor: colors.border,
                          color: colors.text,
                          fontFamily: currentTheme.typography.fontFamily,
                          '--tw-ring-color': colors.primary
                        }}
                      >
                        <option value="">Klasör Seçin (İsteğe Bağlı)</option>
                        <FolderOptions collectionName="letters" />
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
                    Mektup İçeriği
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg resize-none backdrop-blur-sm"
                    style={{
                      backgroundColor: colors.surface + '80',
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting, "Caveat", cursive)' : 
                                  currentTheme.id === 'skull-bunny' ? 'var(--font-mono, monospace)' :
                                  currentTheme.typography.fontFamily,
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder={
                      currentTheme.id === 'skull-bunny' ? 'Enter your dark thoughts...' :
                      currentTheme.id === 'ocean' ? 'Deniz kadar derin düşünceleriniz...' :
                      'Sevgili...'
                    }
                    required
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
                    <span>{editingLetter ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mektuplar Listesi */}
          {letters.length === 0 ? (
            <div 
              className="text-center py-12 backdrop-blur-sm rounded-xl shadow-lg border"
              style={{
                backgroundColor: colors.surface + '80',
                borderColor: colors.border
              }}
            >
              <Heart 
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
                {selectedFolder 
                  ? 'Bu klasörde henüz mektup yok'
                  : 'Henüz mektup yok'
                }
              </h3>
              <p 
                style={{
                  color: colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                {selectedFolder 
                  ? 'Bu klasöre ilk mektubunuzu ekleyin!'
                  : currentTheme.id === 'skull-bunny' ? 'Write your first dark letter...' :
                    'İlk aşk mektubunuzu yazmaya ne dersiniz?'
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
                className="mt-4 px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center space-x-2"
                style={{
                  background: colors.primaryGradient,
                  color: 'white'
                }}
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
                  className={`backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border group cursor-pointer ${
                    currentTheme.id === 'skull-bunny' ? 'hover:animate-flicker' :
                    currentTheme.id === 'ocean' ? 'hover:animate-wave' :
                    currentTheme.id === 'cat' ? 'hover:animate-purr' : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border,
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => setSelectedLetter(letter)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 
                      className="flex-1"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting)' :
                                    currentTheme.id === 'skull-bunny' ? 'var(--font-mono)' :
                                    currentTheme.typography.fontFamilyHeading,
                        fontSize: currentTheme.id === 'cat' ? '1.25rem' : '1.125rem'
                      }}
                    >
                      {letter.title || 'Başlıksız Mektup'}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(letter);
                        }}
                        className="p-1 rounded hover:shadow-sm"
                        style={{ 
                          color: colors.info,
                          backgroundColor: colors.info + '10'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(letter.id);
                        }}
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
                  <div
                    className="mb-4 text-sm overflow-y-auto"
                    style={{
                      color: colors.textSecondary,
                      fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting)' :
                                  currentTheme.id === 'skull-bunny' ? 'var(--font-mono)' :
                                  currentTheme.typography.fontFamily,
                      maxHeight: '180px',
                      minHeight: '80px',
                      paddingRight: '4px',
                      wordBreak: 'break-word'
                    }}
                  >
                    {letter.content}
                  </div>
                  <div 
                    className="flex justify-between items-center text-xs mt-auto"
                    style={{
                      color: colors.textMuted,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
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
            <div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              onClick={() => setSelectedLetter(null)}
            >
              <div 
                className="rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                style={{
                  backgroundColor: colors.surface + '95',
                  backdropFilter: 'blur(20px)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="mb-6 text-center">
                  <h2 
                    className={`text-2xl mb-2 ${
                      currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                    }`}
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamilyHeading
                    }}
                  >
                    {selectedLetter.title || 'Başlıksız Mektup'}
                  </h2>
                  <p 
                    className="text-sm mb-2"
                    style={{
                      color: colors.textSecondary,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {selectedLetter.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                  </p>
                  <p 
                    className="text-xs mb-2"
                    style={{
                      color: colors.textMuted,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {selectedLetter.author}
                  </p>
                </div>
                <div 
                  className="mb-6 overflow-y-auto" 
                  style={{ maxHeight: '320px', minHeight: '120px', paddingRight: '4px' }}
                >
                  <p 
                    className="text-lg whitespace-pre-line"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting)' :
                                  currentTheme.id === 'skull-bunny' ? 'var(--font-mono)' :
                                  currentTheme.typography.fontFamily
                    }}
                  >
                    {selectedLetter.content}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    style={{
                      backgroundColor: colors.primary + '20',
                      color: colors.primary,
                      borderColor: colors.primary + '40'
                    }}
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
