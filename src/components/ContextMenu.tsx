import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, children, className = '' }) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate position relative to viewport
    const x = e.clientX;
    const y = e.clientY;

    // Adjust position if menu would go off-screen
    const menuWidth = 200; // Estimated menu width
    const menuHeight = items.length * 40; // Estimated menu height
    
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    setPosition({ x: adjustedX, y: adjustedY });
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
    }
    handleClose();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleClose);
      window.addEventListener('resize', handleClose);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleClose);
      window.removeEventListener('resize', handleClose);
    };
  }, [isVisible]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        className={`${className}`}
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50" onClick={handleClose} />
          
          {/* Context Menu */}
          <div
            ref={contextMenuRef}
            className={`
              fixed z-50 min-w-48 py-2 rounded-xl border-2 shadow-xl backdrop-blur-lg
              ${currentTheme.id === 'cyberpunk'
                ? 'bg-gray-900/95 border-cyber-primary/30 shadow-neon-blue'
                : 'bg-white/95 border-gray-200 shadow-lg'
              }
              animate-in fade-in-50 slide-in-from-top-2 duration-200
            `}
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.separator && (
                  <div className={`
                    my-1 h-px mx-2 
                    ${currentTheme.id === 'cyberpunk' 
                      ? 'bg-cyber-secondary/20' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all
                    ${item.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : currentTheme.id === 'cyberpunk'
                        ? 'text-cyber-secondary hover:bg-cyber-primary/10 hover:text-cyber-primary focus:bg-cyber-primary/20'
                        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-50'
                    }
                    focus:outline-none
                  `}
                >
                  {item.icon && (
                    <span className={`
                      w-5 h-5 flex items-center justify-center
                      ${currentTheme.id === 'cyberpunk' 
                        ? 'text-cyber-secondary' 
                        : 'text-gray-500'
                      }
                    `}>
                      {item.icon}
                    </span>
                  )}
                  <span className={`
                    font-medium
                    ${currentTheme.id === 'cyberpunk' ? 'font-mono tracking-wide' : ''}
                  `}>
                    {item.label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ContextMenu;