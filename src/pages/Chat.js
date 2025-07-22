import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { MessageCircle, Send, Trash2, Heart, Smile, Camera, Paperclip, Image, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const emojis = ['😺', '😻', '😸', '😹', '😽', '🙀', '😿', '😾', '🐱', '🐾', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '❤️', '💔', '❣️', '💟', '💌', '💋', '💍', '👑', '🌹', '🌺', '🌸', '🌼', '🌻', '🦋', '✨', '⭐', '🌟', '💫', '🔥', '💎'];

  useEffect(() => {
    // Gerçek zamanlı mesaj dinleyici
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse(); // En yeni mesajlar altta olsun
      
      setMessages(messagesData);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Dosya boyutu kontrolü (25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Dosya boyutu 25MB\'dan küçük olmalıdır');
      return;
    }

    setSelectedFile(file);

    // Eğer resim ise önizleme göster
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
        // Dosya mesajı
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
        // Text mesajı
        messageData.content = newMessage.trim();
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      // Formu temizle
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
    // Email'den isim çıkarma - @ işaretinden önceki kısmı al
    if (!email) return 'Anonim';
    const name = email.split('@')[0];
    // İlk harfini büyük yap
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message) => {
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
              <p className="font-handwriting text-base">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
              <Paperclip className="w-5 h-5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{message.fileName}</p>
                <p className="text-xs opacity-75">{formatFileSize(message.fileSize)}</p>
              </div>
              <button
                onClick={() => downloadFile(message)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            {message.content !== `📎 ${message.fileName}` && (
              <p className="font-handwriting text-base">{message.content}</p>
            )}
          </div>
        );
      
      default:
        return (
          <p className="font-handwriting text-base mb-1">
            {message.content}
          </p>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center">
        <h1 className="text-4xl font-romantic text-gray-800 mb-2 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 mr-3" />
          Kedili Sohbet
        </h1>
        <p className="text-lg text-gray-700 font-elegant">
          Birlikte sohbet ettiğiniz özel alan...
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-romantic-200 h-[600px] flex flex-col">
        {/* Mesajlar Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-romantic-300 mx-auto mb-4" />
              <h3 className="text-xl font-romantic text-gray-800 mb-2">
                Henüz mesaj yok
              </h3>
              <p className="text-gray-700">
                İlk mesajınızı göndererek sohbeti başlatın! 💕
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md relative ${
                  isMyMessage(message) ? 'mr-2' : 'ml-2'
                }`}>
                  {/* Gönderen ismi */}
                  <div className={`text-xs text-gray-500 mb-1 ${
                    isMyMessage(message) ? 'text-right' : 'text-left'
                  }`}>
                    {isMyMessage(message) ? 'Sen' : getDisplayName(message.author)}
                  </div>
                  
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-soft group relative ${
                      isMyMessage(message)
                        ? 'bg-paw-gradient text-white'
                        : 'bg-white border border-romantic-200 text-gray-800'
                    }`}
                  >
                    {renderMessage(message)}
                    <div className={`flex items-center justify-between text-xs mt-2 ${
                      isMyMessage(message) ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {isMyMessage(message) && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dosya Önizleme */}
        {selectedFile && (
          <div className="border-t border-romantic-200 p-4 bg-romantic-50/50">
            <div className="flex items-center space-x-3">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Önizleme" 
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-romantic-200 rounded-lg flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-romantic-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
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
        <div className="border-t border-romantic-200 p-2 bg-romantic-50/50">
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {emojis.slice(0, 20).map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="text-lg hover:bg-romantic-100 rounded p-1 transition-colors emoji-interactive"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Mesaj Gönderme Formu */}
        <div className="border-t border-romantic-200 p-4 bg-white/50">
          <form onSubmit={handleSendMessage} className="space-y-3">
            {/* Dosya Seçme Butonları */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 text-romantic-600 hover:bg-romantic-100 rounded-lg transition-colors"
                title="Kamera ile fotoğraf çek"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-romantic-600 hover:bg-romantic-100 rounded-lg transition-colors"
                title="Dosya seç"
              >
                <Paperclip className="w-5 h-5" />
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
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedFile ? "Dosya ile birlikte mesaj..." : "Mesajınızı yazın... 💕"}
                  className="w-full px-4 py-3 pr-12 border border-romantic-200 rounded-full focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/70 text-gray-800 font-handwriting"
                  maxLength={500}
                  disabled={sending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-romantic-400 hover:text-romantic-600 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || sending}
                className="px-6 py-3 bg-love-gradient text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeMediaModal}>
          <div className="max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl overflow-hidden relative">
              {selectedMedia.type === 'image' && (
                <img
                  src={selectedMedia.fileData}
                  alt={selectedMedia.fileName}
                  className="w-full max-h-[70vh] object-contain"
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

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cat-card p-4 text-center">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-sm text-gray-600 mb-1">Toplam Mesaj</p>
          <p className="text-xl font-bold text-gray-800">{messages.length}</p>
        </div>
        <div className="cat-card p-4 text-center">
          <div className="text-2xl mb-2">💕</div>
          <p className="text-sm text-gray-600 mb-1">Bugün Konuştunuz</p>
          <p className="text-xl font-bold text-gray-800">
            {messages.filter(msg => {
              if (!msg.createdAt) return false;
              const today = new Date();
              const msgDate = msg.createdAt.toDate();
              return msgDate.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
        <div className="cat-card p-4 text-center">
          <div className="text-2xl mb-2">😺</div>
          <p className="text-sm text-gray-600 mb-1">Son Mesaj Gönderen</p>
          <p className="text-xl font-bold text-gray-800">
            {messages.length > 0 ? (
              isMyMessage(messages[messages.length - 1]) ? 'Sen' : getDisplayName(messages[messages.length - 1]?.author)
            ) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
