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
import { Camera, Plus, Upload, Edit, Trash2, Save, X, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import FolderManager from '../components/FolderManager';

export default function Gallery() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [formData, setFormData] = useState({
    caption: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    folderId: null
  });

  useEffect(() => {
    fetchPhotos();
  }, [selectedFolder]);

  const fetchPhotos = async () => {
    try {
      let photosQuery;
      
      if (selectedFolder) {
        photosQuery = query(
          collection(db, 'gallery'),
          where('folderId', '==', selectedFolder),
          orderBy('date', 'desc')
        );
      } else {
        photosQuery = query(
          collection(db, 'gallery'),
          orderBy('date', 'desc')
        );
      }
      
      const snapshot = await getDocs(photosQuery);
      const photosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPhotos(photosData);
    } catch (error) {
      console.error('Fotoğraflar yüklenirken hata:', error);
      toast.error('Fotoğraflar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error('Dosya boyutu 25MB\'dan küçük olmalıdır');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.caption.trim()) {
      toast.error('Açıklama boş bırakılamaz');
      return;
    }

    if (!editingPhoto && !formData.file) {
      toast.error('Lütfen bir resim seçin');
      return;
    }

    setUploading(true);
    try {
      let imageBase64 = editingPhoto?.imageBase64;

      // Yeni resim yükleme
      if (formData.file) {
        imageBase64 = await convertToBase64(formData.file);
      }

      const photoData = {
        caption: formData.caption.trim(),
        date: new Date(formData.date),
        imageBase64,
        folderId: formData.folderId,
        author: currentUser.email,
        createdAt: editingPhoto?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingPhoto) {
        await updateDoc(doc(db, 'gallery', editingPhoto.id), photoData);
        toast.success('Fotoğraf güncellendi! 📸');
      } else {
        await addDoc(collection(db, 'gallery'), photoData);
        toast.success('Fotoğraf eklendi! 📸');
      }

      setFormData({ 
        caption: '', 
        date: new Date().toISOString().split('T')[0], 
        file: null,
        folderId: selectedFolder
      });
      setShowForm(false);
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Fotoğraf kaydedilirken hata:', error);
      if (error.message.includes('too large')) {
        toast.error('Resim çok büyük. Lütfen daha küçük bir resim seçin.');
      } else {
        toast.error('Fotoğraf kaydedilemedi');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      caption: photo.caption,
      date: photo.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      file: null,
      folderId: photo.folderId || null
    });
    setShowForm(true);
  };

  const handleDelete = async (photo) => {
    if (window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'gallery', photo.id));
        toast.success('Fotoğraf silindi');
        fetchPhotos();
      } catch (error) {
        console.error('Fotoğraf silinirken hata:', error);
        toast.error('Fotoğraf silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      caption: '', 
      date: new Date().toISOString().split('T')[0], 
      file: null,
      folderId: selectedFolder
    });
    setShowForm(false);
    setEditingPhoto(null);
  };

  const openModal = (photo) => {
    setSelectedImage(photo);
  };

  const closeModal = () => {
    setSelectedImage(null);
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
          <Camera className="w-8 h-8 mr-3" />
          {currentTheme.id === 'skull-bunny' ? 'Dark Gallery' :
           currentTheme.id === 'ocean' ? 'Okyanus Galerimiz' :
           currentTheme.id === 'cat' ? 'Anı Galerimiz' :
           'Foto Galerim'}
        </h1>
        <p 
          className="text-lg"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'skull-bunny' ? 'Dark memories captured in time...' :
           currentTheme.id === 'ocean' ? 'Okyanus derinliklerindeki anılarınız...' :
           currentTheme.id === 'cat' ? 'Birlikte yaşadığınız güzel anların fotoğrafları burada...' :
           'Özel anılarınızın koleksiyonu...'}
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
              collectionName="gallery" 
              onSelectFolder={setSelectedFolder} 
              selectedFolder={selectedFolder}
            />
            
            {/* Yeni Fotoğraf Butonu */}
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
              <span>Fotoğraf Ekle</span>
            </button>
          </div>
        </div>

        {/* Fotoğraflar İçeriği */}
        <div className="md:col-span-3">
          {/* Fotoğraf Formu */}
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
                {editingPhoto ? 'Fotoğrafı Düzenle' : 'Yeni Fotoğraf Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingPhoto && (
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      Fotoğraf Seç
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                        style={{
                          backgroundColor: colors.surface + '50',
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.surfaceVariant;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.surface + '50';
                        }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2" style={{ color: colors.primary }} />
                          <p className="mb-2 text-sm">
                            <span className="font-semibold">Yüklemek için tıklayın</span>
                          </p>
                          <p className="text-xs">PNG, JPG veya JPEG (Max. 25MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                          required
                        />
                      </label>
                    </div>
                    {formData.file && (
                      <div className="mt-3">
                        <p 
                          className="text-sm mb-2"
                          style={{ color: colors.success }}
                        >
                          Seçilen dosya: {formData.file.name}
                        </p>
                        <img 
                          src={URL.createObjectURL(formData.file)} 
                          alt="Önizleme" 
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

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
                        backgroundColor: colors.surface + '50',
                        borderColor: colors.border,
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Klasör (İsteğe Bağlı)
                    </label>
                    <div className="relative">
                      <FolderPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
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
                        <FolderOptions collectionName="gallery" />
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
                    Açıklama
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none backdrop-blur-sm"
                    style={{
                      backgroundColor: colors.surface + '50',
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                    placeholder="Bu fotoğraf hakkında..."
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
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-1 disabled:opacity-50"
                    style={{
                      background: colors.primaryGradient,
                      color: 'white'
                    }}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingPhoto ? 'Güncelle' : 'Kaydet'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fotoğraf Galerisi */}
          {photos.length === 0 ? (
            <div 
              className="text-center py-12 backdrop-blur-sm rounded-xl shadow-lg border"
              style={{
                backgroundColor: colors.surface + '80',
                borderColor: colors.border
              }}
            >
              <Camera 
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
                {selectedFolder ? 'Bu klasörde henüz fotoğraf yok' : 'Henüz fotoğraf yok'}
              </h3>
              <p 
                style={{
                  color: colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                {selectedFolder ? 'Bu klasöre ilk fotoğrafınızı ekleyin!' : 'İlk anı fotoğrafınızı ekleyerek başlayın!'}
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
                <span>Fotoğraf Ekle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border group overflow-hidden ${
                    currentTheme.id === 'ocean' ? 'hover:animate-wave' : 
                    currentTheme.id === 'cat' ? 'hover:animate-purr' : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface + '80',
                    borderColor: colors.border
                  }}
                >
                  <div className="relative">
                    <img
                      src={photo.imageBase64}
                      alt={photo.caption}
                      className="w-full h-64 object-cover cursor-pointer"
                      onClick={() => openModal(photo)}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="%236b7280" font-family="sans-serif" font-size="14">Resim yüklenemedi</text></svg>';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="p-1 rounded-full shadow-lg"
                        style={{
                          backgroundColor: colors.surface + '80',
                          color: colors.info
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(photo)}
                        className="p-1 rounded-full shadow-lg"
                        style={{
                          backgroundColor: colors.surface + '80',
                          color: colors.error
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p 
                      className={`mb-3 ${
                        currentTheme.id === 'cat' ? 'font-handwriting' : 'font-elegant'
                      }`}
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting)' : currentTheme.typography.fontFamily
                      }}
                    >
                      {photo.caption}
                    </p>
                    
                    <div 
                      className="flex justify-between items-center text-xs"
                      style={{
                        color: colors.textMuted,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      <span>{photo.author}</span>
                      <span>
                        {photo.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-[1600]" style={{ backgroundColor: colors.shadow + '80' }} onClick={closeModal}>
          <div className="max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div 
              className="rounded-xl overflow-hidden relative"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <img
                src={selectedImage.imageBase64}
                alt={selectedImage.caption}
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-4">
                <p 
                  className={`text-lg mb-2 ${
                    currentTheme.id === 'cat' ? 'font-handwriting' : 'font-elegant'
                  }`}
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.id === 'cat' ? 'var(--font-handwriting)' : currentTheme.typography.fontFamily
                  }}
                >
                  {selectedImage.caption}
                </p>
                <div 
                  className="flex justify-between items-center text-sm"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
                  <span>{selectedImage.author}</span>
                  <span>
                    {selectedImage.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full shadow-lg"
                style={{
                  backgroundColor: colors.surface + '80',
                  color: colors.textSecondary
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
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
