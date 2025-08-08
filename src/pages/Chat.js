import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { MessageCircle, Send, Trash2, Camera, Paperclip, Download, X, Edit, Check, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import Linkify from 'linkify-react';
import axios from 'axios';

export default function Chat() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
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
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipedMessage, setSwipedMessage] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showQuickReactions, setShowQuickReactions] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [doubleTapTimer, setDoubleTapTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const editInputRef = useRef(null);
  const messageInputRef = useRef(null);


  const linkifyOptions = {
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'underline transition-colors',
    style: { color: currentTheme.colors.primary },
  };

  // Instagram-style swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e, message) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipedMessage(message);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isRightSwipe && swipedMessage) {
      // Swipe right to reply
      handleReplyToMessage(swipedMessage);
      setSwipeDirection('right');
      setTimeout(() => {
        setSwipeDirection(null);
        setSwipedMessage(null);
      }, 300);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Long press for reactions
  const onTouchStartLongPress = (e, message) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      const isMyMsg = isMyMessage(message);

      if (isMyMsg) {
        // Show edit/delete actions for own messages
        setShowMessageActions(message.id);
      } else {
        // Show reactions for others' messages
        setShowQuickReactions(message.id);
      }

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const onTouchEndLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Double click to like functionality
  const handleDoubleClick = (message) => {
    if (isMyMessage(message)) return; // Don't allow liking own messages

    // Add heart reaction with animation
    addEmojiReaction(message.id, '❤️');

    // Show feedback
    toast.success('💕 Mesaj beğenildi!', { duration: 1000 });

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  // Handle single/double tap detection for mobile
  const handleTapEvent = (message) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (doubleTapTimer) {
        clearTimeout(doubleTapTimer);
        setDoubleTapTimer(null);
      }
      handleDoubleClick(message);
    } else {
      // Single tap - set timer for potential double tap
      if (doubleTapTimer) {
        clearTimeout(doubleTapTimer);
      }

      const timer = setTimeout(() => {
        // Single tap action (if needed in future)
        setDoubleTapTimer(null);
      }, DOUBLE_TAP_DELAY);

      setDoubleTapTimer(timer);
    }

    setLastTap(now);
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

  // Ana useEffect - messages listener with debouncing
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    let unsubscribe = null;

    // Add small delay to prevent race conditions with React.StrictMode
    const setupListener = async () => {
      // Wait a small amount to prevent double listeners in development
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMounted) return;

      try {
        const messagesQuery = query(
          collection(db, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          if (!isMounted) return;

          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).reverse();

          setMessages(messagesData);
          scrollToBottom();
        }, (error) => {
          console.error('Messages listener error:', error);
          // Don't show user error for stream issues, just retry
        });
      } catch (error) {
        console.error('Failed to setup messages listener:', error);
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from messages:', error);
        }
      }
    };
  }, [currentUser]);

  // Scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = useCallback(async (userEmail) => {
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
        favoriteEmoji: '��',
        email: userEmail,
        profileImage: null
      };
    }
  }, [userProfiles]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // User profiles effect with debouncing
  useEffect(() => {
    if (messages.length === 0) return;

    let isMounted = true;

    const loadProfiles = async () => {
      // Debounce profile loading
      await new Promise(resolve => setTimeout(resolve, 50));

      if (!isMounted) return;

      const uniqueAuthors = [...new Set(messages.map(msg => msg.author))];
      const authorsToLoad = uniqueAuthors.filter(author =>
        author && !userProfiles[author]
      );

      if (authorsToLoad.length > 0) {
        // Load profiles sequentially to prevent conflicts
        for (const author of authorsToLoad) {
          if (isMounted && !userProfiles[author]) {
            try {
              await fetchUserProfile(author);
            } catch (error) {
              console.error('Error loading profile for:', author, error);
            }
          }
        }
      }
    };

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [messages, userProfiles, fetchUserProfile]);

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
      toast.error('Dosya boyutu 25MB\'dan küçük olmalıd��r');
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



  // Mesaj input değişikliği
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };


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
    toast.success('💬 Kaydırarak yanıtla aktif!', { duration: 1000 });
  };

  // Yanıtı iptal etme
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Emoji ekleme - hızlı reaksiyon için
  const addQuickEmojiReaction = async (messageId, emoji) => {
    await addEmojiReaction(messageId, emoji);
    setShowQuickReactions(null);
    toast.success(`${emoji} reaksiyonu eklendi!`, { duration: 1000 });
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
  
  // Hızlı reaksiyonlar için Instagram-style emojiler
  const quickReactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

  // Yanıtlanan mesajı bulma
  const findReplyMessage = (replyTo) => {
    if (!replyTo) return null;
    return messages.find(m => m.id === replyTo.messageId) || {
      author: replyTo.author,
      content: replyTo.content,
      type: replyTo.type
    };
  };


  const renderMessage = (message) => {
    if (editingMessage === message.id) {
      return (
        <div className="space-y-2">
          <textarea
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 text-sm rounded-lg resize-none focus:outline-none focus:ring-2"
            rows="2"
            style={{ 
              minHeight: '40px',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              '--tw-ring-color': colors.primary,
            }}
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
              className="p-1 hover:shadow-sm rounded text-xs flex items-center space-x-1"
              style={{
                color: colors.success,
                backgroundColor: colors.success + '10'
              }}
            >
              <Check className="w-3 h-3" />
              <span>Kaydet</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 hover:shadow-sm rounded text-xs flex items-center space-x-1"
              style={{
                color: colors.textSecondary,
                backgroundColor: colors.border + '40'
              }}
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
          <div 
            className="rounded-lg p-2 border-l-4 ml-2"
            style={{
              backgroundColor: colors.surfaceVariant + '80',
              borderColor: colors.primary
            }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Reply 
                className="w-3 h-3"
                style={{ color: colors.primary }}
              />
              <span 
                className="text-xs font-medium"
                style={{ color: colors.primary }}
              >
                {getUserProfile(replyMessage.author).displayName}
              </span>
            </div>
            <p 
              className="text-xs truncate"
              style={{ color: colors.textSecondary }}
            >
              {replyMessage.type === 'image' ? '📷 Fotoğraf' :
               replyMessage.type === 'file' ? '📎 Dosya' :
               replyMessage.content}
            </p>
          </div>
        )}

        {/* Ana mesaj içeriği */}
        <div>
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
                      <p 
                        className="text-base font-medium break-words"
                        style={{
                          fontFamily: currentTheme.typography.fontFamily,
                          color: isMyMessage(message) ? 'white' : colors.text
                        }}
                      >{message.content}</p>
                    )}
                  </div>
                );
              
              case 'file':
                return (
                  <div className="space-y-2">
                    <div 
                      className="flex items-center space-x-3 p-3 rounded-lg min-w-0"
                      style={{
                        backgroundColor: isMyMessage(message) ? 'rgba(255,255,255,0.1)' : colors.surfaceVariant
                      }}
                    >
                      <Paperclip 
                        className="w-5 h-5 flex-shrink-0"
                        style={{
                          color: isMyMessage(message) ? 'white' : colors.text
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-medium truncate"
                          style={{
                            color: isMyMessage(message) ? 'white' : colors.text
                          }}
                        >{message.fileName}</p>
                        <p 
                          className="text-xs opacity-75"
                          style={{
                            color: isMyMessage(message) ? 'rgba(255,255,255,0.8)' : colors.textSecondary
                          }}
                        >{formatFileSize(message.fileSize)}</p>
                      </div>
                      <button
                        onClick={() => downloadFile(message)}
                        className="p-1 rounded transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: isMyMessage(message) ? 'rgba(255,255,255,0.1)' : colors.surface,
                          color: isMyMessage(message) ? 'white' : colors.text
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {message.content !== `📎 ${message.fileName}` && (
                      <p 
                        className="text-base font-medium break-words"
                        style={{
                          fontFamily: currentTheme.typography.fontFamily,
                          color: isMyMessage(message) ? 'white' : colors.text
                        }}
                      >{message.content}</p>
                    )}
                  </div>
                );
              
              default:
                const urls = extractUrls(message.content);
                return (
                  <div className="space-y-1">
                    <div 
                      className="text-base font-medium break-words"
                      style={{
                        fontFamily: currentTheme.typography.fontFamily,
                        color: isMyMessage(message) ? 'white' : colors.text
                      }}
                    >
                      <Linkify options={linkifyOptions}>
                        {message.content}
                      </Linkify>
                    </div>
                    {urls.map(url => (
                      <LinkPreviewCard key={url} url={url} />
                    ))}
                    {message.edited && (
                      <p 
                        className="text-xs opacity-60 italic"
                        style={{
                          fontFamily: currentTheme.typography.fontFamily,
                          color: isMyMessage(message) ? 'rgba(255,255,255,0.8)' : colors.textMuted
                        }}
                      >
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
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all transform hover:scale-110 ${
                  reactions.some(r => r.userId === currentUser?.uid)
                    ? 'shadow-sm'
                    : 'hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: reactions.some(r => r.userId === currentUser?.uid)
                    ? colors.primary + '20'
                    : colors.surfaceVariant,
                  color: reactions.some(r => r.userId === currentUser?.uid)
                    ? colors.primary
                    : colors.textSecondary,
                  borderColor: reactions.some(r => r.userId === currentUser?.uid)
                    ? colors.primary + '40'
                    : colors.border,
                  borderWidth: '1px'
                }}
                title={reactions.map(r => getUserProfile(r.userEmail).displayName).join(', ')}
              >
                <span className="animate-pulse">{emoji}</span>
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
      className="fixed inset-0 top-0 left-0 right-0 flex flex-col z-[100] ios-safe-area"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient,
        bottom: 'var(--safe-area-inset-bottom, 0px)'
      }}
    >

      {/* Mesajlar Listesi - Instagram Style */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{
          maxHeight: 'calc(100vh - 120px)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-bounce-cat mb-6">
              <MessageCircle 
                className="w-16 h-16 mx-auto"
                style={{ color: colors.border }}
              />
            </div>
            <h3 
              className="text-xl font-bold mb-3"
              style={{ color: colors.text }}
            >
              Henüz mesaj yok
            </h3>
            <p 
              className="text-sm opacity-80"
              style={{ color: colors.textSecondary }}
            >
              İlk mesajınızı göndererek sohbeti başlatın! 💕
            </p>
            <div className={`mt-4 text-xs space-y-1 ${currentTheme.id === 'cat' ? 'font-cat' : 'font-minimal'}`} style={{ color: colors.textSecondary }}>
              <p>😺 İpucu: Mesajları sağa kaydırarak yanıtlayın</p>
              <p>💕 İpucu: Başkalarının mesajlarını basılı tutarak ifade edin</p>
              <p>��� İpucu: Kendi mesajlarınızı basılı tutarak düzenleyin/silin</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {messages.map((message) => {
              const userProfile = getUserProfile(message.author);
              const isMyMsg = isMyMessage(message);
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${isMyMsg ? 'flex-row-reverse space-x-reverse' : ''} w-full`}
                >
                  {/* Profil Fotoğrafı - Instagram Style */}
                  <div 
                    className="flex-shrink-0 cursor-pointer group"
                    onClick={() => handleProfileClick(message.author)}
                  >
                    <div 
                      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-md group-hover:scale-110 transition-all duration-300"
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
                        <span className="text-lg animate-wiggle">
                          {userProfile.favoriteEmoji}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mesaj Baloncuğu - Instagram Style with Swipe */}
                  <div
                    className={`relative touch-manipulation ${
                      isMyMsg ? 'mr-2' : 'ml-2'
                    } ${swipeDirection === 'right' && swipedMessage?.id === message.id ? 'transform translate-x-4 transition-transform duration-300' : ''}`}
                    style={{
                      maxWidth: '80%',
                      width: 'fit-content',
                      minWidth: '0'
                    }}
                    onTouchStart={(e) => onTouchStart(e, message)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Gönderen ismi - Instagram style */}
                    {!isMyMsg && (
                      <div className="text-xs mb-2 ml-3">
                        <span 
                          className="hover:opacity-70 cursor-pointer font-bold"
                          onClick={() => handleProfileClick(message.author)}
                          style={{ color: colors.textSecondary }}
                        >
                          {userProfile.displayName}
                        </span>
                      </div>
                    )}
                    
                    <div
                      data-message-balloon="true"
                      className={`px-4 py-3 rounded-3xl group relative break-words transition-all duration-300 ${
                        isMyMsg
                          ? 'text-white shadow-lg'
                          : 'border shadow-md'
                      }`}
                      style={{
                        background: isMyMsg
                          ? colors.primaryGradient
                          : colors.surface,
                        borderColor: isMyMsg ? 'transparent' : colors.border,
                        color: isMyMsg ? 'white' : colors.text,
                        boxShadow: isMyMsg
                          ? `0 4px 20px ${colors.primary}40`
                          : `0 2px 12px ${colors.shadow}15`,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                      onTouchStart={(e) => onTouchStartLongPress(e, message)}
                      onTouchEnd={onTouchEndLongPress}
                      onDoubleClick={() => handleDoubleClick(message)}
                      onClick={() => handleTapEvent(message)}
                    >
                      {renderMessage(message)}
                      
                      {/* Mesaj zamanı */}
                      <div className={`text-xs mt-2 ${
                        isMyMsg ? 'text-white/80 text-right' : 'text-left'
                      }`}>
                        <span style={{
                          color: isMyMsg ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary,
                          fontSize: '11px'
                        }}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>

                      {/* Emoji Picker - Instagram Style */}
                      {showEmojiPicker === message.id && (
                        <div 
                          className="absolute bottom-full mb-3 left-0 border rounded-2xl shadow-2xl p-3 z-50 flex flex-wrap gap-2 max-w-xs backdrop-blur-sm"
                          style={{
                            backgroundColor: colors.surface + 'F0',
                            borderColor: colors.border
                          }}
                        >
                          {reactionEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addEmojiReaction(message.id, emoji)}
                              className="p-2 rounded-full text-xl transition-all transform hover:scale-125 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100"
                              style={{
                                backgroundColor: 'transparent'
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hızlı Reaksiyonlar - Cat Theme Style */}
                      {showQuickReactions === message.id && (
                        <div
                          className={`absolute bottom-full mb-3 backdrop-blur-xl rounded-full px-4 py-3 flex space-x-1 z-50 shadow-lg border ${
                            isMyMsg ? 'right-0' : 'left-0'
                          }`}
                          style={{
                            animation: 'slideUp 0.3s ease-out',
                            borderColor: colors.border + '40',
                            background: colors.surface + 'F2',
                            maxWidth: '280px',
                            transform: isMyMsg ? 'translateX(-20px)' : 'translateX(20px)'
                          }}
                        >
                          {quickReactionEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addQuickEmojiReaction(message.id, emoji)}
                              className="text-xl transition-all transform hover:scale-125 active:scale-110 p-2 rounded-full hover:shadow-sm flex-shrink-0"
                              style={{
                                backgroundColor: colors.surfaceVariant,
                                filter: `drop-shadow(0 2px 4px ${colors.shadow}20)`
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Mesaj İşlemleri - Instagram Style (Own Messages) */}
                      {showMessageActions === message.id && isMyMsg && (
                        <div
                          className="absolute bottom-full mb-3 right-0 backdrop-blur-xl rounded-3xl py-2 z-50 shadow-2xl border min-w-max"
                          style={{
                            animation: 'slideUp 0.3s ease-out',
                            borderColor: colors.border + '40',
                            background: colors.surface + 'F2',
                            transform: 'translateX(-20px)',
                            maxWidth: '200px'
                          }}
                        >
                          {message.type === 'text' && (
                            <button
                              onClick={() => {
                                handleEditMessage(message);
                                setShowMessageActions(null);
                              }}
                              className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-all hover:shadow-sm border-b`}
                              style={{ 
                                color: colors.primary,
                                backgroundColor: colors.primary + '10',
                                borderColor: colors.border
                              }}
                            >
                              <Edit className="w-5 h-5" />
                              <span 
                                className="text-base font-medium"
                                style={{ fontFamily: currentTheme.typography.fontFamily }}
                              >Düzenle</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleDeleteMessage(message.id);
                              setShowMessageActions(null);
                            }}
                            className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-all hover:shadow-sm`}
                            style={{ 
                              color: colors.error,
                              backgroundColor: colors.error + '10'
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                            <span 
                              className="text-base font-medium"
                              style={{ fontFamily: currentTheme.typography.fontFamily }}
                            >Sil</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Swipe indicator */}
                    {swipeDirection === 'right' && swipedMessage?.id === message.id && (
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 text-blue-500">
                        <Reply className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Yanıt Önizlemesi - Instagram Style */}
      {replyingTo && (
        <div 
          className="border-t p-4 flex-shrink-0 backdrop-blur-sm"
          style={{
            backgroundColor: colors.surfaceVariant + 'CC',
            borderColor: colors.border
          }}
        >
          <div 
            className="flex items-start justify-between rounded-2xl p-3"
            style={{
              backgroundColor: colors.primary + '10'
            }}
          >
            <div className="flex items-start space-x-3 flex-1">
              <Reply 
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: colors.primary }}
              />
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {getUserProfile(replyingTo.author).displayName} kullanıcısına yanıt veriyorsunuz
                </p>
                <p 
                  className="text-xs truncate mt-1 opacity-80"
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
              className="p-2 rounded-full transition-all hover:bg-red-100 ml-3"
              style={{ color: colors.error }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Dosya Önizleme - Instagram Style */}
      {selectedFile && (
        <div 
          className="border-t p-4 flex-shrink-0 backdrop-blur-sm"
          style={{
            backgroundColor: colors.surfaceVariant + '80',
            borderColor: colors.border
          }}
        >
          <div 
            className="flex items-center space-x-4 rounded-2xl p-3"
            style={{
              backgroundColor: colors.surface
            }}
          >
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Önizleme" 
                className="w-16 h-16 object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Paperclip 
                  className="w-6 h-6"
                  style={{ color: colors.primary }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p 
                className="font-bold truncate"
                style={{ color: colors.text }}
              >
                {selectedFile.name}
              </p>
              <p 
                className="text-sm opacity-80"
                style={{ color: colors.textSecondary }}
              >
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={removeSelectedFile}
              className="p-2 rounded-full transition-all hover:bg-red-100"
              style={{ color: colors.error }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}


      {/* Mesaj Gönderme Formu - Instagram Style */}
      <div
        className="border-t p-4 flex-shrink-0 w-full backdrop-blur-sm mt-auto"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface + '90',
          paddingBottom: 'calc(var(--safe-area-inset-bottom, 0px) + 1rem)'
        }}
      >
        <form onSubmit={handleSendMessage} className="w-full">
          {/* Mesaj Input ve Gönder - Instagram Style */}
          <div className="flex space-x-3 w-full">
            <div className="flex-1 relative w-full">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={handleMessageChange}
                placeholder={selectedFile ? "Dosya ile birlikte mesaj..." :
                           replyingTo ? "Yanıtınızı yazın..." : "Mesajınızı yazın... 💕"}
                className="w-full px-5 py-4 pr-24 border-2 rounded-3xl focus:ring-2 focus:border-transparent font-medium resize-none text-base shadow-lg transition-all"
                rows="1"
                style={{
                  minHeight: '56px',
                  maxHeight: '120px',
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  '--tw-ring-color': colors.primary,
                }}
                onInput={(e) => {
                  e.target.style.height = '56px';
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
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="transition-all hover:scale-110"
                  title="Kamera ile fotoğraf çek"
                  style={{ color: colors.textSecondary }}
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="transition-all hover:scale-110"
                  title="Dosya seç"
                  style={{ color: colors.textSecondary }}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
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
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="px-6 py-4 text-white rounded-full hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 self-end transform hover:scale-105 active:scale-95"
              style={{
                background: colors.primaryGradient,
                minWidth: '56px',
                height: '56px'
              }}
            >
              {sending ? (
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                ></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Media Modal - Instagram Style */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1600] backdrop-blur-sm" onClick={closeMediaModal}>
          <div className="w-full max-w-4xl max-h-full p-6" onClick={(e) => e.stopPropagation()}>
            <div 
              className="rounded-3xl overflow-hidden relative w-full shadow-2xl"
              style={{
                backgroundColor: colors.surface
              }}
            >
              {selectedMedia.type === 'image' && (
                <img
                  src={selectedMedia.fileData}
                  alt={selectedMedia.fileName}
                  className="w-full max-h-[70vh] object-contain"
                  style={{ maxWidth: '100%' }}
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p 
                      className="font-bold text-lg"
                      style={{ color: colors.text }}
                    >{selectedMedia.fileName}</p>
                    <p 
                      className="text-sm mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {getDisplayName(selectedMedia.author)} • {formatTime(selectedMedia.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(selectedMedia)}
                    className="p-3 hover:shadow-sm rounded-full transition-all transform hover:scale-110"
                    style={{
                      color: colors.textSecondary,
                      backgroundColor: colors.surfaceVariant
                    }}
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <button
                onClick={closeMediaModal}
                className="absolute top-4 right-4 p-3 hover:shadow-lg rounded-full shadow-xl transition-all transform hover:scale-110"
                style={{
                  backgroundColor: colors.surface + 'E6',
                  color: colors.text
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profil Modal - Instagram Style */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1600] p-4 backdrop-blur-sm" onClick={closeProfileModal}>
          <div 
            className="rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="text-center">
              {/* Profil Fotoğrafı */}
              <div className="flex justify-center mb-6">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-xl"
                  style={{
                    background: colors.primaryGradient
                  }}
                >
                  {selectedProfile.profileImage ? (
                    <img
                      src={selectedProfile.profileImage}
                      alt={selectedProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl animate-bounce-cat">
                      {selectedProfile.favoriteEmoji}
                    </span>
                  )}
                </div>
              </div>

              {/* Profil Bilgileri */}
              <h3 
                className="text-2xl font-bold mb-3"
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamilyHeading
                }}
              >
                {selectedProfile.displayName}
              </h3>
              <p 
                className="text-sm mb-6"
                style={{ color: colors.textSecondary }}
              >
                {selectedProfile.email}
              </p>

              {selectedProfile.bio && (
                <div 
                  className="rounded-2xl p-4 mb-6"
                  style={{
                    backgroundColor: colors.surfaceVariant
                  }}
                >
                  <p 
                    className="text-sm font-medium italic"
                    style={{ color: colors.text }}
                  >
                    "{selectedProfile.bio}"
                  </p>
                </div>
              )}

              {selectedProfile.favoriteQuote && (
                <div 
                  className="rounded-2xl p-4 mb-6 border-l-4"
                  style={{
                    backgroundColor: colors.primary + '10',
                    borderColor: colors.primary
                  }}
                >
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    "{selectedProfile.favoriteQuote}"
                  </p>
                </div>
              )}

              {/* Kullanıcı Rozeti */}
              <div className="flex justify-center items-center space-x-3 text-sm mb-6">
                <span 
                  className="px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm"
                  style={{
                    backgroundColor: colors.primary + '15',
                    color: colors.primary
                  }}
                >
                  <span className="animate-wiggle">🐱</span>
                  <span className="font-bold">Kedici</span>
                </span>
                {selectedProfile.email === currentUser.email && (
                  <span 
                    className="px-4 py-2 rounded-full font-bold shadow-sm"
                    style={{
                      backgroundColor: colors.accent + '20',
                      color: colors.accent
                    }}
                  >
                    Sen
                  </span>
                )}
              </div>

              {/* Kapatma Butonu */}
              <button
                onClick={closeProfileModal}
                className="w-full px-6 py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 font-bold shadow-lg transform hover:scale-105"
                style={{
                  background: colors.primaryGradient,
                  color: 'white'
                }}
              >
                <X className="w-5 h-5" />
                <span>Kapat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reactions Backdrop */}
      {showQuickReactions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowQuickReactions(null);
          }}
        />
      )}

      {/* Message Actions Backdrop */}
      {showMessageActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMessageActions(null);
          }}
        />
      )}

    </div>
  );
}
