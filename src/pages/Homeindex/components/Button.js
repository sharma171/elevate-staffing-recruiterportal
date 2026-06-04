
import React from 'react';

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'outline':
        return 'btn-outline';
      case 'ghost':
        return 'btn-ghost';
      default:
        return 'btn-primary';
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return '';
      case 'md':
        return '';
      case 'lg':
        return 'btn-lg';
      default:
        return '';
    }
  };
  
  const isIcon = props.icon === true;
  
  return (
    <button 
      className={`btn ${getVariantClass()} ${getSizeClass()} ${isIcon ? 'btn-icon' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;