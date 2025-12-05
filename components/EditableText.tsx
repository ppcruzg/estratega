import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  multiline?: boolean;
  variant?: 'light' | 'dark'; // light = white text (headers), dark = slate text (cards)
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  className = '', 
  multiline = false,
  variant = 'light',
  placeholder = 'Click to edit'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    // Save even if empty to allow clearing descriptions
    onSave(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  const baseInputStyles = "rounded px-1 outline-none w-full border transition-colors font-inherit";
  const variantStyles = variant === 'light' 
    ? "bg-white/20 text-white border-white/30 focus:bg-white/30 placeholder-white/50" 
    : "bg-white text-slate-800 border-blue-300 focus:ring-2 focus:ring-blue-100 shadow-sm placeholder-slate-300";

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={stopPropagation}
          onPointerDown={stopPropagation}
          className={`${baseInputStyles} ${variantStyles} resize-none ${className}`}
          rows={3}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseDown={stopPropagation}
        onPointerDown={stopPropagation}
        className={`${baseInputStyles} ${variantStyles} ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation(); // Prevent drag start when clicking to edit
        setIsEditing(true);
      }}
      className={`cursor-pointer rounded px-1 -ml-1 border border-transparent transition-all relative group 
        ${variant === 'light' ? 'hover:bg-white/10 hover:border-white/10' : 'hover:bg-slate-100 hover:border-slate-200'} 
        ${!value ? 'italic opacity-60 text-xs py-1' : ''}
        ${className}`}
      title="Click to edit"
    >
      {value || placeholder}
      <Pencil className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-3 h-3 
        ${variant === 'light' ? 'text-white' : 'text-slate-400'}`} 
      />
    </div>
  );
};

export default EditableText;