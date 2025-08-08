import React, { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  enableIOSSafeArea?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '', 
  enableIOSSafeArea = true 
}) => {
  const { /* currentTheme */ } = useTheme();
  
  const safeAreaClass = enableIOSSafeArea ? 'ios-safe-bottom' : '';
  
  return (
    <div className={`w-full max-w-full overflow-hidden ${safeAreaClass} ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
