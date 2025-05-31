'use client';

import { useState } from 'react';

type BiographyProps = {
  text: string;
};

export default function Biography({ text }: BiographyProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // If text is short enough, don't show the expand/collapse functionality
  if (text.length <= 300) {
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">About</h3>
        <p className="text-gray-100">{text}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">About</h3>
      <div className="relative">
        <p className={`text-gray-100`}>
          {text}
        </p>
      </div>
    </div>
  );
} 