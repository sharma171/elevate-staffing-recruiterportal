
import React, { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Find trigger and content components
  const trigger = React.Children.toArray(children).find(
    child => child.type === DropdownMenuTrigger
  );
  
  const content = React.Children.toArray(children).find(
    child => child.type === DropdownMenuContent
  );
  
  // Clone them with necessary props
  const clonedTrigger = React.cloneElement(trigger, {
    onClick: () => setIsOpen(!isOpen),
  });
  
  const clonedContent = isOpen ? React.cloneElement(content, {
    isOpen,
  }) : null;
  
  return (
    <div className={`dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      {clonedTrigger}
      {clonedContent}
    </div>
  );
}

export function DropdownMenuTrigger({ children, onClick, asChild }) {
  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      onClick: (e) => {
        e.preventDefault();
        onClick();
        if (children.props.onClick) {
          children.props.onClick(e);
        }
      },
    });
  }
  
  return (
    <button className="btn" onClick={onClick}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, isOpen, align = 'start' }) {
  if (!isOpen) return null;
  
  return (
    <div className={`dropdown-content ${align === 'end' ? 'right-0' : 'left-0'}`}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick }) {
  return (
    <button className="dropdown-item" onClick={onClick}>
      {children}
    </button>
  );
}