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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Music, Plus, Edit, Trash2, Save, X, ExternalLink, Youtube, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MusicPage() {
  const { currentUser } = useAuth();
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
          <Music className="w-8 h-8 mr-3" />
          Ortak Müzik Listemiz
        </h1>
        <p className="text-lg text-romantic-600 font-elegant">
          Birlikte dinlediğiniz ve sevdiğiniz şarkılar burada...
        </p>
      </div>

      {/* Yeni Şarkı Butonu */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-love-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Şarkı Ekle</span>
        </button>
      </div>

      {/* Şarkı Formu */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
          <h2 className="text-2xl font-romantic text-romantic-700 mb-6">
            {editingSong ? 'Şarkıyı Düzenle' : 'Yeni Şarkı Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Şarkı Adı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                  placeholder="Şarkı adı..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Sanatçı
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                  placeholder="Sanatçı adı..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
              >
                <option value="youtube">YouTube</option>
                <option value="spotify">Spotify</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Link (İsteğe Bağlı)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Not (İsteğe Bağlı)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 resize-none"
                placeholder="Bu şarkı hakkında özel notunuz..."
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
                <span>{editingSong ? 'Güncelle' : 'Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Şarkılar Listesi */}
      {songs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-romantic-300 mx-auto mb-4" />
          <h3 className="text-xl font-romantic text-romantic-600 mb-2">
            Henüz şarkı yok
          </h3>
          <p className="text-romantic-500">
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
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-romantic-100 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-handwriting text-lg text-romantic-700 mb-1">
                      {song.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {song.artist}
                    </p>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(song)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                      src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowfullscreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                )}

                {song.note && (
                  <p className="text-sm text-gray-700 mb-3 italic">
                    "{song.note}"
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {song.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {song.platform === 'spotify' && <Music className="w-4 h-4 text-green-500" />}
                    <span className="text-xs text-gray-500 capitalize">{song.platform}</span>
                  </div>
                  
                  {song.url && (
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-romantic-600 hover:text-romantic-700 text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Dinle</span>
                    </a>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-romantic-100">
                  <p className="text-xs text-romantic-500">
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
