import React, { useState } from "react";

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Tooltip content */}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-normal max-w-xs">
          {text}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}

      {/* Question mark circle */}
      <div
        className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        ?
      </div>
    </div>
  );
};

export default Tooltip;
