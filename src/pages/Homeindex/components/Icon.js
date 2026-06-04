
import React from 'react';
import * as LucideIcons from 'lucide-react';

function Icon({ name, size = 24, color, className = '' }) {
  const LucideIcon = LucideIcons[name];
  
  if (!LucideIcon) {
    console.error(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <LucideIcon 
      size={size} 
      color={color}
      className={className}
    />
  );
}

export default Icon;