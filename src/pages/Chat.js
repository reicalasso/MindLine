import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { MessageCircle, Send, Trash2, Smile, Camera, Paperclip, Download, X, Edit, Check, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Linkify from 'linkify-react';
import axios from 'axios';

export default function Chat() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [userProfiles, setUserProfiles] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const editInputRef = useRef(null);

  const emojis = ['😺', '😻', '😸', '😹', '😽', '🙀', '😿', '😾', '🐱', '🐾', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '❤️', '💔', '❣️', '💟', '💌', '💋', '💍', '👑'];

  const linkifyOptions = {
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'text-blue-500 underline hover:text-blue-700 transition-colors',
  };

  // Instagram-vari Link Preview Kartı
  function LinkPreviewCard({ url }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
      let cancelled = false;
      axios.get(`http://localhost:4000/preview?url=${encodeURIComponent(url)}`)
        .then(res => {
          if (!cancelled) setPreview(res.data);
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [url]);

    if (!preview || !preview.title) return null;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-xs sm:max-w-sm md:max-w-md mt-2 border border-gray-200 rounded-lg shadow hover:shadow-md transition bg-white"
        style={{ textDecoration: 'none', overflow: 'hidden' }}
      >
        {preview.images?.[0] && (
          <img
            src={preview.images[0]}
            alt={preview.title}
            className="w-full h-36 object-cover rounded-t-lg"
            style={{ maxWidth: '100%' }}
          />
        )}
        <div className="p-2">
          <div className="font-semibold text-sm line-clamp-1 text-gray-800">{preview.title}</div>
          {preview.description && (
            <div className="text-xs text-gray-600 line-clamp-2">{preview.description}</div>
          )}
          {preview.siteName && (
            <div className="text-xs text-blue-500 mt-1">{preview.siteName}</div>
          )}
        </div>
      </a>
    );
  }

  // Mesaj içeriğinde linkleri bul
  function extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  // Ana useEffect - messages listener
  useEffect(() => {
    if (!currentUser) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      setMessages(messagesData);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Scroll to bottom effect
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // User profiles effect
  useEffect(() => {
    if (messages.length > 0) {
      const uniqueAuthors = [...new Set(messages.map(msg => msg.author))];
      uniqueAuthors.forEach(author => {
        if (!userProfiles[author]) {
          fetchUserProfile(author);
        }
      });
    }
  }, [messages, userProfiles]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async (userEmail) => {
    if (userProfiles[userEmail]) return userProfiles[userEmail];
    
    try {
      const profilesQuery = query(collection(db, 'profiles'));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      for (const profileDoc of profilesSnapshot.docs) {
        const profileData = profileDoc.data();
        if (profileData.email === userEmail) {
          const profile = {
            uid: profileDoc.id,
            ...profileData
          };
          setUserProfiles(prev => ({ ...prev, [userEmail]: profile }));
          return profile;
        }
      }
      
      const defaultProfile = {
        displayName: userEmail.split('@')[0],
        favoriteEmoji: '😺',
        email: userEmail,
        profileImage: null
      };
      setUserProfiles(prev => ({ ...prev, [userEmail]: defaultProfile }));
      return defaultProfile;
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      return {
        displayName: userEmail.split('@')[0],
        favoriteEmoji: '😺',
        email: userEmail,
        profileImage: null
      };
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Dosya boyutu 25MB\'dan küçük olmalıdır');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      try {
        const base64 = await convertFileToBase64(file);
        setPreviewImage(base64);
      } catch (error) {
        console.error('Resim önizleme hatası:', error);
      }
    } else {
      setPreviewImage(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    setSending(true);
    try {
      let messageData = {
        author: currentUser.email,
        createdAt: serverTimestamp(),
        type: 'text'
      };

      if (selectedFile) {
        const fileBase64 = await convertFileToBase64(selectedFile);
        messageData = {
          ...messageData,
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          fileData: fileBase64,
          content: newMessage.trim() || `📎 ${selectedFile.name}`
        };
      } else {
        messageData.content = newMessage.trim();
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      setNewMessage('');
      setSelectedFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      toast.error('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        toast.success('Mesaj silindi');
      } catch (error) {
        console.error('Mesaj silinirken hata:', error);
        toast.error('Mesaj silinemedi');
      }
    }
  };

  const handleEditMessage = (message) => {
    if (message.type !== 'text') {
      toast.error('Sadece metin mesajları düzenlenebilir');
      return;
    }
    setEditingMessage(message.id);
    setEditText(message.content);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = async (messageId) => {
    if (!editText.trim()) {
      toast.error('Mesaj boş olamaz');
      return;
    }

    try {
      await updateDoc(doc(db, 'messages', messageId), {
        content: editText.trim(),
        updatedAt: serverTimestamp(),
        edited: true
      });
      toast.success('Mesaj düzenlendi');
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Mesaj düzenlenirken hata:', error);
      toast.error('Mesaj düzenlenemedi');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isMyMessage = (message) => {
    return message.author === currentUser?.email;
  };

  const getDisplayName = (email) => {
    if (!email) return 'Anonim';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const downloadFile = (message) => {
    try {
      const link = document.createElement('a');
      link.href = message.fileData;
      link.download = message.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      toast.error('Dosya indirilemedi');
    }
  };

  const openMediaModal = (message) => {
    setSelectedMedia(message);
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
    setShowMediaModal(false);
  };

  const handleProfileClick = async (userEmail) => {
    const profile = await fetchUserProfile(userEmail);
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const getUserProfile = (userEmail) => {
    return userProfiles[userEmail] || {
      displayName: userEmail.split('@')[0],
      favoriteEmoji: '😺',
      email: userEmail,
      profileImage: null
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Link preview için yardımcı fonksiyon
  const fetchLinkPreview = async (url) => {
    try {
      // jsonlink.io API ile önizleme al
      const res = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        title: data.title,
        description: data.description,
        image: data.images?.[0],
        url: data.url
      };
    } catch {
      return null;
    }
  };

  // Link preview bileşeni
  function LinkPreview({ url }) {
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      let mounted = true;
      fetchLinkPreview(url).then(data => {
        if (mounted) {
          if (data && (data.title || data.description || data.image)) {
            setPreview(data);
          } else {
            setError(true);
          }
        }
      }).catch(() => {
        if (mounted) setError(true);
      });
      return () => { mounted = false; };
    }, [url]);

    if (error) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 text-xs text-gray-500">
          <span>Bağlantı önizlenemiyor.</span>
        </div>
      );
    }

    if (!preview) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 text-xs text-gray-500">
          <span>Bağlantı önizleniyor...</span>
        </div>
      );
    }

    return (
      <a href={preview.url || url} target="_blank" rel="noopener noreferrer"
        className="block bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 hover:bg-gray-100 transition-colors"
        style={{ textDecoration: 'none' }}>
        <div className="flex items-center space-x-3">
          {preview.image && (
            <img src={preview.image} alt="preview" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800 truncate">{preview.title || url}</div>
            {preview.description && (
              <div className="text-xs text-gray-600 truncate">{preview.description}</div>
            )}
            <div className="text-xs text-blue-500 truncate">{preview.url || url}</div>
          </div>
        </div>
      </a>
    );
  }

  // Mesaj içeriğinde link varsa bul
  function extractFirstUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  const renderMessage = (message) => {
    if (editingMessage === message.id) {
      return (
        <div className="space-y-2">
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 text-sm font-elegant bg-white/90 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            style={{ minHeight: '40px' }}
            onInput={(e) => {
              e.target.style.height = '40px';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit(message.id);
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleSaveEdit(message.id)}
              className="p-1 text-green-600 hover:bg-green-50 rounded text-xs flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Kaydet</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded text-xs flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>İptal</span>
            </button>
          </div>
        </div>
      );
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.fileData}
              alt={message.fileName}
              className="max-w-64 max-h-64 rounded-lg cursor-pointer object-cover"
              onClick={() => openMediaModal(message)}
            />
            {message.content !== `📎 ${message.fileName}` && (
              <p className="font-elegant text-base font-medium break-words">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg min-w-0">
              <Paperclip className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{message.fileName}</p>
                <p className="text-xs opacity-75">{formatFileSize(message.fileSize)}</p>
              </div>
              <button
                onClick={() => downloadFile(message)}
                className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {message.content !== `📎 ${message.fileName}` && (
              <p className="font-elegant text-base font-medium break-words">{message.content}</p>
            )}
          </div>
        );
      
      default:
        const urls = extractUrls(message.content);
        return (
          <div className="space-y-1">
            <div className="font-elegant text-base font-medium break-words">
              <Linkify options={linkifyOptions}>
                {message.content}
              </Linkify>
            </div>
            {urls.map(url => (
              <LinkPreviewCard key={url} url={url} />
            ))}
            {message.edited && (
              <p className="text-xs opacity-60 italic font-elegant">
                (düzenlendi)
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 flex flex-col bg-white/90 backdrop-blur-sm">
      {/* Başlık */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-romantic-200 p-3 flex-shrink-0 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-romantic text-gray-800 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Kedili Sohbet
          </h1>
          <p className="text-xs text-gray-700 font-elegant">
            Birlikte sohbet ettiğiniz özel alan...
          </p>
        </div>
      </div>

      {/* Mesajlar Listesi */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{
          maxHeight: 'calc(100vh - 280px)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-romantic-300 mx-auto mb-3" />
            <h3 className="text-lg font-romantic text-gray-800 mb-2">
              Henüz mesaj yok
            </h3>
            <p className="text-gray-700 text-sm">
              İlk mesajınızı göndererek sohbeti başlatın! 💕
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {messages.map((message) => {
              const userProfile = getUserProfile(message.author);
              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${isMyMessage(message) ? 'flex-row-reverse space-x-reverse' : ''} w-full`}
                >
                  {/* Profil Fotoğrafı */}
                  <div 
                    className="flex-shrink-0 cursor-pointer group"
                    onClick={() => handleProfileClick(message.author)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                      {userProfile.profileImage ? (
                        <img
                          src={userProfile.profileImage}
                          alt={userProfile.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm animate-wiggle">
                          {userProfile.favoriteEmoji}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mesaj Baloncuğu */}
                  <div
                    className={`relative ${
                      isMyMessage(message)
                        ? 'mr-2'
                        : 'ml-2'
                    }`}
                    style={{
                      maxWidth: '100%',
                      width: '100%'
                    }}
                  >
                    {/* Gönderen ismi - sadece diğer kullanıcılar için */}
                    {!isMyMessage(message) && (
                      <div className="text-xs text-gray-500 mb-1 ml-1">
                        <span 
                          className="hover:text-gray-700 cursor-pointer font-medium"
                          onClick={() => handleProfileClick(message.author)}
                        >
                          {userProfile.displayName}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-2xl shadow-soft group relative break-words ${
                        isMyMessage(message)
                          ? 'bg-paw-gradient text-white'
                          : 'bg-white border border-romantic-200 text-gray-800'
                      }`}
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                    >
                      {renderMessage(message)}
                      <div className={`flex items-center justify-between text-xs mt-1 ${
                        isMyMessage(message) ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {isMyMessage(message) && editingMessage !== message.id && (
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {message.type === 'text' && (
                              <button
                                onClick={() => handleEditMessage(message)}
                                className="ml-1 hover:text-blue-200"
                                title="Düzenle"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="ml-1 hover:text-red-200"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dosya Önizleme */}
      {selectedFile && (
        <div className="border-t border-romantic-200 p-3 bg-romantic-50/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Önizleme" 
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-romantic-200 rounded-lg flex items-center justify-center">
                <Paperclip className="w-5 h-5 text-romantic-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={removeSelectedFile}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      <div className="border-t border-romantic-200 p-2 bg-romantic-50/50 flex-shrink-0">
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
          {emojis.slice(0, 15).map((emoji, index) => (
            <button
              key={index}
              onClick={() => addEmoji(emoji)}
              className="text-sm hover:bg-romantic-100 rounded p-1 transition-colors emoji-interactive"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Mesaj Gönderme Formu */}
      <div className="border-t border-romantic-200 p-3 bg-white/50 flex-shrink-0 w-full">
        <form onSubmit={handleSendMessage} className="space-y-2 w-full">
          {/* Dosya Seçme Butonları */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 text-romantic-600 hover:bg-romantic-100 rounded-lg transition-colors"
              title="Kamera ile fotoğraf çek"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-romantic-600 hover:bg-romantic-100 rounded-lg transition-colors"
              title="Dosya seç"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {/* Mesaj Input ve Gönder */}
          <div className="flex space-x-2 w-full">
            <div className="flex-1 relative w-full">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedFile ? "Dosya ile birlikte mesaj..." : "Mesajınızı yazın... 💕"}
                className="w-full px-3 py-2 pr-10 border border-romantic-200 rounded-xl focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70 text-gray-800 font-elegant font-medium resize-none text-sm"
                rows="1"
                style={{ minHeight: '40px', maxHeight: '80px' }}
                onInput={(e) => {
                  e.target.style.height = '40px';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                maxLength={1000}
                disabled={sending}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-romantic-400 hover:text-romantic-600 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="px-4 py-2 bg-love-gradient text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 self-end"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeMediaModal}>
          <div className="w-full max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl overflow-hidden relative w-full">
              {selectedMedia.type === 'image' && (
                <img
                  src={selectedMedia.fileData}
                  alt={selectedMedia.fileName}
                  className="w-full max-h-[70vh] object-contain"
                  style={{ maxWidth: '100%' }}
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{selectedMedia.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {getDisplayName(selectedMedia.author)} • {formatTime(selectedMedia.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(selectedMedia)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={closeMediaModal}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profil Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeProfileModal}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              {/* Profil Fotoğrafı */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center shadow-lg">
                  {selectedProfile.profileImage ? (
                    <img
                      src={selectedProfile.profileImage}
                      alt={selectedProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl animate-bounce-cat">
                      {selectedProfile.favoriteEmoji}
                    </span>
                  )}
                </div>
              </div>

              {/* Profil Bilgileri */}
              <h3 className="text-xl font-cat text-gray-800 mb-2">
                {selectedProfile.displayName}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedProfile.email}
              </p>

              {selectedProfile.bio && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 font-handwriting italic">
                    "{selectedProfile.bio}"
                  </p>
                </div>
              )}

              {selectedProfile.favoriteQuote && (
                <div className="bg-pink-50 rounded-lg p-3 mb-4 border-l-4 border-pink-400">
                  <p className="text-sm text-gray-700 font-elegant">
                    "{selectedProfile.favoriteQuote}"
                  </p>
                </div>
              )}

              {/* Kullanıcı Rozeti */}
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-600 mb-4">
                <span className="bg-romantic-100 text-romantic-700 px-3 py-1 rounded-full flex items-center space-x-1">
                  <span className="animate-wiggle">🐱</span>
                  <span>Kedici</span>
                </span>
                {selectedProfile.email === currentUser.email && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Sen
                  </span>
                )}
              </div>

              {/* Kapatma Butonu */}
              <button
                onClick={closeProfileModal}
                className="w-full bg-romantic-100 hover:bg-romantic-200 text-romantic-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Kapat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
