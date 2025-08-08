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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Music, Plus, Edit, Save, X, Trash2, ExternalLink, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MusicPage() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: '',
    note: '',
    platform: 'youtube'
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const songsQuery = query(
        collection(db, 'music'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(songsQuery);
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSongs(songsData);
    } catch (error) {
      console.error('Müzikler yüklenirken hata:', error);
      toast.error('Müzikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const extractSpotifyId = (url) => {
    const regex = /(?:open\.spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.artist.trim()) {
      toast.error('Şarkı adı ve sanatçı adı boş bırakılamaz');
      return;
    }

    try {
      const songData = {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        url: formData.url.trim(),
        note: formData.note.trim(),
        platform: formData.platform,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingSong) {
        await updateDoc(doc(db, 'music', editingSong.id), {
          ...songData,
          createdAt: editingSong.createdAt
        });
        toast.success('Şarkı güncellendi! 🎵');
      } else {
        await addDoc(collection(db, 'music'), songData);
        toast.success('Şarkı eklendi! 🎵');
      }

      setFormData({ title: '', artist: '', url: '', note: '', platform: 'youtube' });
      setShowForm(false);
      setEditingSong(null);
      fetchSongs();
    } catch (error) {
      console.error('Şarkı kaydedilirken hata:', error);
      toast.error('Şarkı kaydedilemedi');
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      url: song.url,
      note: song.note,
      platform: song.platform
    });
    setShowForm(true);
  };

  const handleDelete = async (songId) => {
    if (window.confirm('Bu şarkıyı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'music', songId));
        toast.success('Şarkı silindi');
        fetchSongs();
      } catch (error) {
        console.error('Şarkı silinirken hata:', error);
        toast.error('Şarkı silinemedi');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', artist: '', url: '', note: '', platform: 'youtube' });
    setShowForm(false);
    setEditingSong(null);
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
          <Music className="w-8 h-8 mr-3" />
          {currentTheme.id === 'ocean' ? 'Okyanus Melodileri' : 
           currentTheme.id === 'cat' ? 'Ortak Müzik Listemiz' :
           'Müzik Koleksiyonum'}
        </h1>
        <p 
          className="text-lg font-elegant"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'ocean' ? 'Derin sulardan yükselen melodik anılar...' :
           currentTheme.id === 'cat' ? 'Birlikte dinlediğiniz ve sevdiğiniz şarkılar burada...' :
           'Favori şarkılarınızı keşfedin...'}
        </p>
      </div>

      {/* Yeni Şarkı Butonu */}
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
          <span>Şarkı Ekle</span>
        </button>
      </div>

      {/* Şarkı Formu */}
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
            {editingSong ? 'Şarkıyı Düzenle' : 'Yeni Şarkı Ekle'}
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
                  Şarkı Adı
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
                  placeholder="Şarkı adı..."
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
                  Sanatçı
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: colors.surface + '50',
                    borderColor: colors.border,
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                  placeholder="Sanatçı adı..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
              >
                <option value="youtube">YouTube</option>
                <option value="spotify">Spotify</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Link (İsteğe Bağlı)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Not (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm resize-none"
                placeholder="Bu şarkı hakkında özel notunuz..."
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
                <span>{editingSong ? 'Güncelle' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Şarkılar Listesi */}
      {songs.length === 0 ? (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: colors.primary + '20',
              color: colors.primary
            }}
          >
            <Music className="w-8 h-8" />
          </div>
          <h3 
            className="text-xl font-bold mb-2"
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            Henüz şarkı yok
          </h3>
          <p 
            style={{
              color: colors.textSecondary,
              fontFamily: currentTheme.typography.fontFamily
            }}
          >
            İlk şarkınızı ekleyerek başlayın!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => {
            const videoId = song.platform === 'youtube' ? extractVideoId(song.url) : null;
            const spotifyId = song.platform === 'spotify' ? extractSpotifyId(song.url) : null;
            
            return (
              <div
                key={song.id}
                className={`backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border group ${
                  currentTheme.id === 'ocean' ? 'hover:animate-wave' : 
                  currentTheme.id === 'cat' ? 'hover:animate-purr' : ''
                }`}
                style={{
                  backgroundColor: colors.surface + '80',
                  borderColor: colors.border,
                  boxShadow: `0 8px 30px ${colors.shadow}20`
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 
                      className={`text-lg mb-1 ${
                        currentTheme.id === 'cat' ? 'font-handwriting' : 'font-elegant'
                      }`}
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamilyHeading
                      }}
                    >
                      {song.title}
                    </h3>
                    <p 
                      className="text-sm mb-2"
                      style={{
                        color: colors.textSecondary,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {song.artist}
                    </p>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(song)}
                      className="p-1 hover:bg-blue-50 rounded"
                      style={{ color: colors.info }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="p-1 hover:bg-red-50 rounded"
                      style={{ color: colors.error }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* YouTube Thumbnail */}
                {videoId && (
                  <div className="mb-3">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Spotify Embed */}
                {spotifyId && (
                  <div className="mb-3">
                    <iframe
                      title={`Music player for ${song.title}`}
                      src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                )}

                {song.note && (
                  <p 
                    className="text-sm mb-3 italic"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    "{song.note}"
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {song.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {song.platform === 'spotify' && <Music className="w-4 h-4 text-green-500" />}
                    <span 
                      className="text-xs capitalize"
                      style={{
                        color: colors.textMuted,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {song.platform}
                    </span>
                  </div>
                  
                  {song.url && (
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm transition-colors hover:shadow-sm px-2 py-1 rounded"
                      style={{
                        color: colors.primary,
                        backgroundColor: colors.primary + '10'
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Dinle</span>
                    </a>
                  )}
                </div>

                <div 
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <p 
                    className="text-xs"
                    style={{
                      color: colors.textMuted,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {song.author} tarafından eklendi
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
