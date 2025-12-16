"use client";
import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string; // Add description prop
  children: React.ReactNode;
  maxWidth?: string;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }) => {
  const titleId = useId(); // Generate a unique ID for the title
  const descriptionId = useId(); // Generate a unique ID for the description

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        role="dialog" // Indicate that this is a dialog
        aria-modal="true" // Indicate that this is a modal dialog
        aria-labelledby={titleId} // Link the dialog to its title
        aria-describedby={description ? descriptionId : undefined} // Link the dialog to its description
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} transform transition-all duration-300 ease-in-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 id={titleId} className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        {description && (
            <p id={descriptionId} className="sr-only">{description}</p> // Visually hidden description
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
