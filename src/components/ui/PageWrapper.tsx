import React, { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  // Destructuring but not using currentTheme currently
  const { /* currentTheme */ } = useTheme();
  
  return (
    <div className={`w-full max-w-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
