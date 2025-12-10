"use client";
import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type FilterDropdownProps = {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
};

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, isOpen, onToggle, onClose, children, isActive, className }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg shadow-sm text-sm transition-colors
                    ${isActive ? 'border-purple-500 text-purple-600 font-bold' : 'border-slate-200 text-slate-600 font-medium'}
                    hover:border-purple-500`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};
