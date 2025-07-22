import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Camera, Save, X, Upload, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    letters: 0,
    messages: 0,
    photos: 0,
    todos: 0
  });
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    favoriteQuote: '',
    profileImage: null,
    favoriteEmoji: '😺'
  });
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    favoriteQuote: '',
    file: null,
    favoriteEmoji: '😺'
  });

  const emojiOptions = ['😺', '😻', '😸', '😹', '😽', '🙀', '😿', '😾', '🐱', '🐾', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '❤️', '💔', '❣️', '💟', '💌', '💋', '💍', '👑'];

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfileData(data);
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          favoriteQuote: data.favoriteQuote || '',
          file: null,
          favoriteEmoji: data.favoriteEmoji || '😺'
        });
      } else {
        // İlk kez profil oluşturuluyor
        const defaultData = {
          displayName: currentUser.email.split('@')[0],
          bio: '',
          favoriteQuote: '',
          profileImage: null,
          favoriteEmoji: '😺'
        };
        setProfileData(defaultData);
        setFormData({
          displayName: defaultData.displayName,
          bio: '',
          favoriteQuote: '',
          file: null,
          favoriteEmoji: '😺'
        });
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      toast.error('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Kullanıcının gerçek verilerini al
      const [lettersSnap, messagesSnap, photosSnap, todosSnap] = await Promise.all([
        getDocs(query(collection(db, 'letters'), where('author', '==', currentUser.email))),
        getDocs(query(collection(db, 'messages'), where('author', '==', currentUser.email))),
        getDocs(query(collection(db, 'gallery'), where('author', '==', currentUser.email))),
        getDocs(query(collection(db, 'todos'), where('author', '==', currentUser.email)))
      ]);

      setStats({
        letters: lettersSnap.size,
        messages: messagesSnap.size,
        photos: photosSnap.size,
        todos: todosSnap.size
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      // Hata durumunda istatistikleri sıfırla
      setStats({
        letters: 0,
        messages: 0,
        photos: 0,
        todos: 0
      });
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      toast.error('Görünen ad boş olamaz');
      return;
    }

    setSaving(true);
    try {
      let profileImage = profileData.profileImage;

      // Yeni resim yüklendiyse base64'e çevir
      if (formData.file) {
        profileImage = await convertToBase64(formData.file);
      }

      const updatedData = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        favoriteQuote: formData.favoriteQuote.trim(),
        favoriteEmoji: formData.favoriteEmoji,
        profileImage,
        email: currentUser.email,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'profiles', currentUser.uid), updatedData, { merge: true });
      
      setProfileData(updatedData);
      setShowForm(false);
      toast.success('Profil güncellendi! 😸');
    } catch (error) {
      console.error('Profil kaydedilirken hata:', error);
      toast.error('Profil kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      displayName: profileData.displayName || '',
      bio: profileData.bio || '',
      favoriteQuote: profileData.favoriteQuote || '',
      file: null,
      favoriteEmoji: profileData.favoriteEmoji || '😺'
    });
    setShowForm(false);
  };

  const getDisplayName = () => {
    return profileData.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';
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
          <User className="w-8 h-8 mr-3" />
          Profilim
        </h1>
        <p className="text-lg text-gray-700 font-elegant">
          Kedili kimliğinizi özelleştirin...
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profil Kartı */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-romantic-200 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profil Fotoğrafı */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center shadow-2xl">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl md:text-7xl animate-bounce-cat">
                    {profileData.favoriteEmoji}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Profil Bilgileri */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-cat text-gray-800 mb-2">
                {getDisplayName()}
              </h2>
              <p className="text-lg text-gray-600 mb-4">{currentUser.email}</p>
              
              {profileData.bio && (
                <p className="text-gray-700 font-handwriting text-lg mb-4 italic">
                  "{profileData.bio}"
                </p>
              )}
              
              {profileData.favoriteQuote && (
                <blockquote className="border-l-4 border-pink-400 pl-4 py-2 bg-pink-50 rounded-r-lg">
                  <p className="text-gray-700 font-elegant italic">
                    "{profileData.favoriteQuote}"
                  </p>
                </blockquote>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="mt-6 bg-love-gradient text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2 mx-auto md:mx-0"
              >
                <Edit className="w-5 h-5" />
                <span>Profili Düzenle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gerçek İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-romantic-200">
            <div className="text-3xl mb-2">💌</div>
            <p className="text-2xl font-bold text-gray-800">{stats.letters}</p>
            <p className="text-sm text-gray-600">Mektup</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-romantic-200">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-2xl font-bold text-gray-800">{stats.messages}</p>
            <p className="text-sm text-gray-600">Mesaj</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-romantic-200">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-2xl font-bold text-gray-800">{stats.photos}</p>
            <p className="text-sm text-gray-600">Fotoğraf</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-romantic-200">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-2xl font-bold text-gray-800">{stats.todos}</p>
            <p className="text-sm text-gray-600">Görev</p>
          </div>
        </div>
      </div>

      {/* Düzenleme Formu */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-romantic text-gray-800 mb-6 text-center">
              Profili Düzenle
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profil Fotoğrafı Yükleme */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-800 mb-4">
                  Profil Fotoğrafı
                </label>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center">
                      {formData.file ? (
                        <img
                          src={URL.createObjectURL(formData.file)}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      ) : profileData.profileImage ? (
                        <img
                          src={profileData.profileImage}
                          alt="Mevcut"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">{formData.favoriteEmoji}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <label className="bg-romantic-100 hover:bg-romantic-200 text-romantic-700 px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Fotoğraf Yükle</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                {formData.file && (
                  <p className="text-sm text-green-600 mt-2">
                    Seçilen: {formData.file.name}
                  </p>
                )}
              </div>

              {/* Form Alanları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Görünen Ad
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-romantic-200 rounded-xl focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70"
                    placeholder="Kedici adınız..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Favori Emoji
                  </label>
                  <select
                    value={formData.favoriteEmoji}
                    onChange={(e) => setFormData({ ...formData, favoriteEmoji: e.target.value })}
                    className="w-full px-4 py-3 border border-romantic-200 rounded-xl focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70"
                  >
                    {emojiOptions.map(emoji => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Hakkımda
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-romantic-200 rounded-xl focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70 resize-none"
                  placeholder="Kendinizi tanıtın..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Favori Sözünüz
                </label>
                <textarea
                  value={formData.favoriteQuote}
                  onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-romantic-200 rounded-xl focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70 resize-none"
                  placeholder="İlham veren sözünüz..."
                />
              </div>

              {/* Form Butonları */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>İptal</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-love-gradient text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
