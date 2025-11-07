
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './icons';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-surface dark:bg-dark-surface shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="sheet-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};
