import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
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
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { MessageCircle, Send, Trash2, Smile, Camera, Paperclip, Download, X, Edit, Check, User, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import Linkify from 'linkify-react';
import axios from 'axios';

export default function Chat() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const editInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const emojis = ['😺', '😻', '😸', '😹', '😽', '🙀', '😿', '😾', '🐱', '🐾', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '❤️', '💔', '❣️', '💟', '💌', '💋', '💍', '👑'];

  const linkifyOptions = {
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'underline transition-colors',
    style: { color: currentTheme.colors.primary },
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

  // Yazıyor göstergesi için useEffect
  useEffect(() => {
    if (!currentUser) return;

    const typingQuery = query(collection(db, 'typing'));
    const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typing = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userEmail !== currentUser.email && data.isTyping) {
          typing.add(data.userEmail);
        }
      });
      setTypingUsers(typing);
    });

    return unsubscribe;
  }, [currentUser]);

  // Yazıyor durumu güncelleme
  const updateTypingStatus = async (typing) => {
    if (!currentUser) return;
    
    try {
      const typingDocId = currentUser.email.replace(/[@.]/g, '_');
      const typingRef = doc(db, 'typing', typingDocId);
      
      await updateDoc(typingRef, {
        userEmail: currentUser.email,
        isTyping: typing,
        timestamp: serverTimestamp()
      }).catch(async () => {
        // Doküman yoksa oluştur
        await addDoc(collection(db, 'typing'), {
          userEmail: currentUser.email,
          isTyping: typing,
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      console.error('Yazıyor durumu güncellenemedi:', error);
    }
  };

  // Mesaj input değişikliği
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    // Yazıyor göstergesi
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
    
    // Timeout ile yazıyor durumunu kapat
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 3000);
  };

  // Component unmount'ta yazıyor durumunu temizle
  useEffect(() => {
    return () => {
      if (isTyping) {
        updateTypingStatus(false);
      }
    };
  }, [isTyping]);

  // Utility fonksiyonlar
  const getUserProfile = (userEmail) => {
    return userProfiles[userEmail] || {
      displayName: userEmail?.split('@')[0] || 'Bilinmeyen',
      favoriteEmoji: '😺',
      email: userEmail,
      profileImage: null
    };
  };

  const isMyMessage = (message) => {
    return message.author === currentUser?.email;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}sa`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDisplayName = (userEmail) => {
    const profile = getUserProfile(userEmail);
    return profile.displayName;
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    messageInputRef.current?.focus();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openMediaModal = (message) => {
    setSelectedMedia(message);
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
    setShowMediaModal(false);
  };

  const handleProfileClick = (userEmail) => {
    const profile = getUserProfile(userEmail);
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
    setShowProfileModal(false);
  };

  const downloadFile = (message) => {
    if (!message.fileData) return;
    
    try {
      const link = document.createElement('a');
      link.href = message.fileData;
      link.download = message.fileName || 'dosya';
      link.click();
    } catch (error) {
      console.error('Dosya indirilemedi:', error);
      toast.error('Dosya indirilemedi');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'messages', messageId));
      toast.success('Mesaj silindi');
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
      toast.error('Mesaj silinemedi');
    }
  };

  const handleEditMessage = (message) => {
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
        edited: true,
        editedAt: serverTimestamp()
      });
      
      setEditingMessage(null);
      setEditText('');
      toast.success('Mesaj güncellendi');
    } catch (error) {
      console.error('Mesaj güncellenirken hata:', error);
      toast.error('Mesaj güncellenemedi');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    // Yazıyor durumunu kapat
    if (isTyping) {
      setIsTyping(false);
      updateTypingStatus(false);
    }

    setSending(true);
    try {
      let messageData = {
        author: currentUser.email,
        createdAt: serverTimestamp(),
        type: 'text'
      };

      // Yanıt veriyorsa referans ekle
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          author: replyingTo.author,
          content: replyingTo.content?.substring(0, 100) || 'Dosya',
          type: replyingTo.type
        };
      }

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
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      toast.error('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  // Mesaja yanıt verme
  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  // Yanıtı iptal etme
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Emoji ekleme
  const addEmojiReaction = async (messageId, emoji) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) return;

      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.userId === currentUser.uid && r.emoji === emoji);
      
      let newReactions;
      if (existingReaction) {
        // Mevcut reaksiyonu kaldır
        newReactions = reactions.filter(r => !(r.userId === currentUser.uid && r.emoji === emoji));
      } else {
        // Yeni reaksiyon ekle, önce aynı kullanıcının diğer reaksiyonlarını kaldır
        newReactions = reactions.filter(r => r.userId !== currentUser.uid);
        newReactions.push({
          emoji,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          timestamp: new Date()
        });
      }

      await updateDoc(messageRef, {
        reactions: newReactions,
        updatedAt: serverTimestamp()
      });

      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Emoji reaksiyonu eklenirken hata:', error);
      toast.error('Reaksiyon eklenemedi');
    }
  };

  // Emoji picker için emojiler
  const reactionEmojis = ['❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '😺', '💕', '🔥', '💯'];

  // Yanıtlanan mesajı bulma
  const findReplyMessage = (replyTo) => {
    if (!replyTo) return null;
    return messages.find(m => m.id === replyTo.messageId) || {
      author: replyTo.author,
      content: replyTo.content,
      type: replyTo.type
    };
  };

  // Yazıyor göstergesi bileşeni
  const TypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers);
    const userNames = typingUsersList.map(email => {
      const profile = getUserProfile(email);
      return profile.displayName;
    });

    return (
      <div className="flex items-center space-x-2 px-4 py-2" style={{ color: colors.textSecondary }}>
        <div className="flex space-x-1">
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: colors.primary }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: colors.primary,
              animationDelay: '0.1s' 
            }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: colors.primary,
              animationDelay: '0.2s' 
            }}
          ></div>
        </div>
        <span className="text-sm">
          {userNames.length === 1 
            ? `${userNames[0]} yazıyor...`
            : `${userNames.join(', ')} yazıyor...`
          }
        </span>
      </div>
    );
  };

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

    const replyMessage = findReplyMessage(message.replyTo);

    return (
      <div className="space-y-2">
        {/* Yanıtlanan mesaj önizlemesi */}
        {replyMessage && (
          <div className="bg-black/10 rounded-lg p-2 border-l-4 border-blue-400 ml-2">
            <div className="flex items-center space-x-2 mb-1">
              <Reply className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600">
                {getUserProfile(replyMessage.author).displayName}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">
              {replyMessage.type === 'image' ? '📷 Fotoğraf' :
               replyMessage.type === 'file' ? '📎 Dosya' :
               replyMessage.content}
            </p>
          </div>
        )}

        {/* Ana mesaj içeriği */}
        <div>
          {/* ...existing message rendering code... */}
          {(() => {
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
          })()}
        </div>

        {/* Emoji reaksiyonları */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(
              message.reactions.reduce((acc, reaction) => {
                if (!acc[reaction.emoji]) {
                  acc[reaction.emoji] = [];
                }
                acc[reaction.emoji].push(reaction);
                return acc;
              }, {})
            ).map(([emoji, reactions]) => (
              <button
                key={emoji}
                onClick={() => addEmojiReaction(message.id, emoji)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  reactions.some(r => r.userId === currentUser?.uid)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={reactions.map(r => getUserProfile(r.userEmail).displayName).join(', ')}
              >
                <span>{emoji}</span>
                <span>{reactions.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 flex flex-col z-[100]"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient 
      }}
    >
      {/* Başlık */}
      <div 
        className="shadow-sm backdrop-blur-sm border-b p-3 flex-shrink-0"
        style={{
          backgroundColor: colors.surface + 'F5', // 95% opacity
          borderColor: colors.border
        }}
      >
        <div className="text-center">
          <h1 
            className="text-xl font-romantic flex items-center justify-center"
            style={{ color: colors.text }}
          >
            <MessageCircle 
              className="w-5 h-5 mr-2" 
              style={{ color: colors.primary }}
            />
            Kedili Sohbet
          </h1>
          <p 
            className="text-xs font-elegant"
            style={{ color: colors.textSecondary }}
          >
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
            <MessageCircle 
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: colors.border }}
            />
            <h3 
              className="text-lg font-romantic mb-2"
              style={{ color: colors.text }}
            >
              Henüz mesaj yok
            </h3>
            <p 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
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
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-sm group-hover:scale-110 transition-transform"
                      style={{
                        backgroundImage: colors.primaryGradient,
                        borderColor: colors.surface
                      }}
                    >
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
                      maxWidth: '70%',
                      width: 'fit-content',
                      minWidth: '0'
                    }}
                  >
                    {/* Gönderen ismi - sadece diğer kullanıcılar için */}
                    {!isMyMessage(message) && (
                      <div className="text-xs mb-1 ml-1">
                        <span 
                          className="hover:opacity-70 cursor-pointer font-medium"
                          onClick={() => handleProfileClick(message.author)}
                          style={{ color: colors.textSecondary }}
                        >
                          {userProfile.displayName}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-2xl group relative break-words ${
                        isMyMessage(message)
                          ? 'text-white'
                          : 'border'
                      }`}
                      style={{
                        background: isMyMessage(message) 
                          ? colors.primaryGradient 
                          : colors.surface,
                        borderColor: isMyMessage(message) ? 'transparent' : colors.border,
                        color: isMyMessage(message) ? 'white' : colors.text,
                        boxShadow: `0 2px 8px ${colors.shadow}20`,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                    >
                      {renderMessage(message)}
                      
                      {/* Mesaj altında işlemler */}
                      <div className={`flex items-center justify-between text-xs mt-1 ${
                        isMyMessage(message) ? 'text-white/80' : ''
                      }`}>
                        <span style={{ 
                          color: isMyMessage(message) ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary 
                        }}>
                          {formatTime(message.createdAt)}
                        </span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Emoji reaksiyon butonu */}
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            className="ml-1 hover:opacity-70 relative"
                            title="Reaksiyon ekle"
                            style={{ 
                              color: isMyMessage(message) ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary 
                            }}
                          >
                            <Smile className="w-3 h-3" />
                          </button>
                          
                          {/* Yanıt verme butonu */}
                          <button
                            onClick={() => handleReplyToMessage(message)}
                            className="ml-1 hover:opacity-70"
                            title="Yanıtla"
                            style={{ 
                              color: isMyMessage(message) ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary 
                            }}
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          
                          {/* Sadece kendi mesajları için düzenleme/silme */}
                          {isMyMessage(message) && editingMessage !== message.id && (
                            <>
                              {message.type === 'text' && (
                                <button
                                  onClick={() => handleEditMessage(message)}
                                  className="ml-1 hover:opacity-70"
                                  title="Düzenle"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="ml-1 hover:opacity-70"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Emoji Picker */}
                      {showEmojiPicker === message.id && (
                        <div 
                          className="absolute bottom-full mb-2 left-0 border rounded-lg shadow-lg p-2 z-50 flex flex-wrap gap-1 max-w-xs"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: colors.border
                          }}
                        >
                          {reactionEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addEmojiReaction(message.id, emoji)}
                              className="p-1 rounded text-lg transition-colors"
                              style={{
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.surfaceVariant;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Yazıyor göstergesi */}
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Yanıt Önizlemesi */}
      {replyingTo && (
        <div 
          className="border-t p-3 flex-shrink-0"
          style={{
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <Reply 
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: colors.primary }}
              />
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  {getUserProfile(replyingTo.author).displayName} kullanıcısına yanıt veriyorsunuz
                </p>
                <p 
                  className="text-xs truncate"
                  style={{ color: colors.textSecondary }}
                >
                  {replyingTo.type === 'image' ? '📷 Fotoğraf' :
                   replyingTo.type === 'file' ? '📎 Dosya' :
                   replyingTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={cancelReply}
              className="p-1 rounded transition-colors ml-2"
              style={{ color: colors.primary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dosya Önizleme */}
      {selectedFile && (
        <div 
          className="border-t p-3 flex-shrink-0"
          style={{
            backgroundColor: colors.surfaceVariant + '80',
            borderColor: colors.border
          }}
        >
          <div className="flex items-center space-x-3">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Önizleme" 
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.border }}
              >
                <Paperclip 
                  className="w-5 h-5"
                  style={{ color: colors.textSecondary }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p 
                className="font-medium truncate text-sm"
                style={{ color: colors.text }}
              >
                {selectedFile.name}
              </p>
              <p 
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={removeSelectedFile}
              className="p-1 rounded transition-colors"
              style={{ color: colors.error }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      <div 
        className="border-t p-2 flex-shrink-0"
        style={{
          backgroundColor: colors.surfaceVariant + '80',
          borderColor: colors.border
        }}
      >
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
          {emojis.slice(0, 15).map((emoji, index) => (
            <button
              key={index}
              onClick={() => addEmoji(emoji)}
              className="text-sm rounded p-1 transition-colors emoji-interactive"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Mesaj Gönderme Formu */}
      <div 
        className="border-t p-3 flex-shrink-0 w-full"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface + '80'
        }}
      >
        <form onSubmit={handleSendMessage} className="space-y-2 w-full">
          {/* Dosya Seçme Butonları */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-lg transition-colors"
              title="Kamera ile fotoğraf çek"
              style={{ color: colors.primary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg transition-colors"
              title="Dosya seç"
              style={{ color: colors.primary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
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
                ref={messageInputRef}
                value={newMessage}
                onChange={handleMessageChange}
                placeholder={selectedFile ? "Dosya ile birlikte mesaj..." : 
                           replyingTo ? "Yanıtınızı yazın..." : "Mesajınızı yazın... 💕"}
                className="w-full px-3 py-2 pr-10 border rounded-xl focus:ring-2 focus:border-transparent font-medium resize-none text-sm font-elegant"
                rows="1"
                style={{ 
                  minHeight: '40px', 
                  maxHeight: '80px',
                  borderColor: colors.border,
                  backgroundColor: colors.surface + 'B3', // 70% opacity
                  color: colors.text
                }}
                onInput={(e) => {
                  e.target.style.height = '40px';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  } else if (e.key === 'Escape' && replyingTo) {
                    cancelReply();
                  }
                }}
                maxLength={1000}
                disabled={sending}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-colors"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.textSecondary;
                }}
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="px-4 py-2 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 self-end"
              style={{
                background: colors.primaryGradient
              }}
            >
              {sending ? (
                <div 
                  className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                ></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1600]" onClick={closeMediaModal}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1600] p-4" onClick={closeProfileModal}>
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
