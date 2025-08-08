import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, writeBatch } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Folder, FolderPlus, Edit, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FolderManager({ collectionName, onSelectFolder, selectedFolder, showAllOption = true }) {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [folders, setFolders] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, [collectionName]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const foldersQuery = query(
        collection(db, `folders_${collectionName}`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(foldersQuery);
      const foldersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(foldersData);
    } catch (error) {
      console.error('Klasörler yüklenirken hata:', error);
      toast.error('Klasörler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Klasör adı boş olamaz');
      return;
    }

    try {
      const folderData = {
        name: newFolderName.trim(),
        author: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, `folders_${collectionName}`), folderData);
      toast.success('Klasör oluşturuldu');
      setNewFolderName('');
      setIsCreating(false);
      fetchFolders();
    } catch (error) {
      console.error('Klasör oluşturulurken hata:', error);
      toast.error('Klasör oluşturulamadı');
    }
  };

  const handleUpdateFolder = async (folderId) => {
    if (!newFolderName.trim()) {
      toast.error('Klasör adı boş olamaz');
      return;
    }

    try {
      await updateDoc(doc(db, `folders_${collectionName}`, folderId), {
        name: newFolderName.trim(),
        updatedAt: serverTimestamp()
      });
      toast.success('Klasör güncellendi');
      setNewFolderName('');
      setIsEditing(null);
      fetchFolders();
    } catch (error) {
      console.error('Klasör güncellenirken hata:', error);
      toast.error('Klasör güncellenemedi');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Bu klasörü silmek istediğinizden emin misiniz? İçerisindeki tüm öğeler "Kategorisiz" olarak işaretlenecektir.')) {
      try {
        const batch = writeBatch(db);

        // 1. Bu klasördeki tüm öğeleri bul
        // NOT: Bu sorgu, öğe koleksiyonu büyükse bir dizin gerektirebilir.
        // Gerekli dizin: folderId (artan), author (artan)
        const itemsQuery = query(
          collection(db, collectionName), 
          where('folderId', '==', folderId),
          where('author', '==', currentUser.email)
        );
        const itemsSnapshot = await getDocs(itemsQuery);

        // 2. Öğelerin folderId'sini null olarak güncellemek için batch'e ekle
        itemsSnapshot.forEach(itemDoc => {
          const itemRef = doc(db, collectionName, itemDoc.id);
          batch.update(itemRef, { folderId: null });
        });

        // 3. Klasörün kendisini silmek için batch'e ekle
        const folderRef = doc(db, `folders_${collectionName}`, folderId);
        batch.delete(folderRef);

        // 4. Tüm işlemleri gerçekleştir
        await batch.commit();

        toast.success('Klasör silindi ve içindeki öğeler taşındı.');
        
        // Eğer silinen klasör seçiliyse, seçimi kaldır
        if (selectedFolder === folderId) {
          onSelectFolder(null);
        }
        
        fetchFolders();
      } catch (error) {
        console.error('Klasör silinirken hata:', error);
        toast.error('Klasör silinemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const startEditing = (folder) => {
    setIsEditing(folder.id);
    setNewFolderName(folder.name);
  };

  const cancelAction = () => {
    setIsCreating(false);
    setIsEditing(null);
    setNewFolderName('');
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 
          className="text-lg font-medium flex items-center"
          style={{
            color: colors.text,
            fontFamily: currentTheme.typography.fontFamilyHeading
          }}
        >
          <Folder className="w-5 h-5 mr-2" />
          Klasörler
        </h3>
        
        {!isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="text-sm flex items-center transition-colors hover:shadow-sm px-2 py-1 rounded"
            style={{
              color: colors.primary,
              backgroundColor: colors.primary + '10'
            }}
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            <span>Yeni</span>
          </button>
        )}
      </div>
      
      {isCreating && (
        <div 
          className="flex items-center space-x-2 mb-3 p-2 rounded-lg"
          style={{
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '20'
          }}
        >
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamily
            }}
            placeholder="Klasör adı..."
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="p-1 transition-colors hover:shadow-sm rounded"
            style={{ 
              color: colors.success,
              backgroundColor: colors.success + '10'
            }}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={cancelAction}
            className="p-1 transition-colors hover:shadow-sm rounded"
            style={{ 
              color: colors.error,
              backgroundColor: colors.error + '10'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-4">
            <div 
              className="animate-spin rounded-full h-5 w-5 mx-auto border-b-2"
              style={{ borderColor: colors.primary }}
            ></div>
          </div>
        ) : (
          <>
            {showAllOption && (
              <div
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  selectedFolder === null ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: selectedFolder === null ? colors.primary + '15' : 'transparent',
                  color: colors.text
                }}
                onClick={() => onSelectFolder(null)}
              >
                <div className="flex items-center">
                  <Folder className="w-4 h-4 mr-2" style={{ color: colors.textSecondary }} />
                  <span>Tümünü Göster</span>
                </div>
              </div>
            )}
            
            {folders.length === 0 && !loading ? (
              <div 
                className="text-center py-2 text-sm"
                style={{
                  color: colors.textMuted,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                Henüz klasör yok
              </div>
            ) : (
              folders.map(folder => (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between p-2 rounded-lg ${
                    isEditing === folder.id ? '' : 'hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isEditing === folder.id 
                      ? colors.primary + '10'
                      : selectedFolder === folder.id
                        ? colors.primary + '15'
                        : 'transparent',
                    fontWeight: selectedFolder === folder.id ? '500' : 'normal'
                  }}
                >
                  {isEditing === folder.id ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateFolder(folder.id)}
                        className="p-1 rounded transition-colors"
                        style={{ 
                          color: colors.success,
                          backgroundColor: colors.success + '10'
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelAction}
                        className="p-1 rounded transition-colors"
                        style={{ 
                          color: colors.error,
                          backgroundColor: colors.error + '10'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => onSelectFolder(folder.id)}
                      >
                        <Folder className="w-4 h-4 mr-2" style={{ color: colors.primary }} />
                        <span 
                          className="truncate"
                          style={{
                            color: colors.text,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          {folder.name}
                        </span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(folder)}
                          className="p-1 rounded transition-colors"
                          style={{ 
                            color: colors.info,
                            backgroundColor: colors.info + '10'
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-1 rounded transition-colors"
                          style={{ 
                            color: colors.error,
                            backgroundColor: colors.error + '10'
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
