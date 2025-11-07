
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './icons';

// Card
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`bg-surface dark:bg-dark-surface rounded-2xl shadow-material p-6 transition-all duration-200 ease-out ${className || ''}`} {...props}>
    {children}
  </div>
);

// Button
// FIX: Added size prop to ButtonProps to allow for different button sizes.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
// FIX: Updated Button component to handle the new 'size' prop.
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center border border-transparent font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-background transition-colors duration-200";
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-blue-700 focus:ring-secondary",
    ghost: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-secondary",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

// Badge
interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}
export const Badge: React.FC<BadgeProps> = ({ children, color = 'bg-gray-100 text-gray-800', className }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} dark:bg-gray-700 dark:text-gray-300 ${className || ''}`}>
    {children}
  </span>
);

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-offset-dark-background ${className || ''}`}
    ref={ref}
    {...props}
  />
));

// Label
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className || ''}`}
        {...props}
    />
));

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-offset-dark-background ${className || ''}`}
        {...props}
    />
));


// Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-lg m-4">
                <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
                        {title}
                    </h3>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={onClose}>
                        <XIcon className="w-5 h-5" />
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
