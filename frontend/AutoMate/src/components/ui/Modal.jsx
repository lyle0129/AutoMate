import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = ''
}) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={`
          relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transform transition-all animate-scaleIn
          w-full ${sizeClasses[size]} mx-4 sm:mx-0 ${className}
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100" id="modal-title">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-gray-700 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirm Modal Variant
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const footer = (
    <>
      <Button variant="outline" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default Modal;
