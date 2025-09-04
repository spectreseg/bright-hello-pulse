import React from 'react';

interface SpeechBubbleProps {
  text: string;
  className?: string;
}

export default function SpeechBubble({ text, className = '' }: SpeechBubbleProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Speech bubble */}
      <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200 relative">
        <p className="text-gray-800 text-lg font-medium text-center leading-relaxed">
          {text}
        </p>
        
        {/* Speech bubble tail */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white"></div>
          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[11px] border-r-[11px] border-t-[11px] border-l-transparent border-r-transparent border-t-gray-200"></div>
        </div>
      </div>
    </div>
  );
}