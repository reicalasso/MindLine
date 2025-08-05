/* Cyberpunk Tema için Tarama Çizgisi Bileşeni */
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function CyberScanLine() {
  const { currentTheme } = useTheme();
  const [showScanLine, setShowScanLine] = useState(false);

  useEffect(() => {
    // Sadece cyberpunk tema aktifse tarama çizgisini göster
    if (currentTheme.id === 'cyberpunk') {
      setShowScanLine(true);
    } else {
      setShowScanLine(false);
    }
  }, [currentTheme]);

  if (!showScanLine) return null;

  return <div className="cyber-scan-line" />;
}
