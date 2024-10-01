// src/components/ui/card.js

import React from 'react';

export function Card({ children, className }) {
  return <div className={`bg-white rounded shadow p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="border-b pb-2 mb-4">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-xl font-semibold">{children}</h3>;
}

export function CardDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}