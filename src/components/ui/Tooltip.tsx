import React, { useState } from "react";

interface TooltipProps {
  text: string;
  className?: string;
  tooltipClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  className = "",
  tooltipClassName = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Tooltip trigger - info icon */}
      <button
        className="flex items-center justify-center w-3 h-3 text-[8px] font-bold text-primary-200 rounded-full border border-primary-200"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-label={text}
        type="button"
      >
        i
      </button>

      {/* Tooltip content */}
      {isVisible && (
        <div
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-3 py-2 text-sm text-white bg-gray-800 rounded shadow-lg transition-opacity duration-200 ease-in-out opacity-100 z-10 max-w-xs ${tooltipClassName}`}
          role="tooltip"
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
