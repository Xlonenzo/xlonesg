// src/components/ui/badge.js

import React from 'react';

export function Badge({ children, variant, className }) {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded";
  const variantClasses = variant === 'outline' ? 'border border-gray-300 text-gray-700' : 'bg-blue-500 text-white';
  return <span className={`${baseClasses} ${variantClasses} ${className}`}>{children}</span>;
}
