import React, { useState, useRef, useEffect } from "react";

const ScrollableSelect = ({
  options,
  onSelect,
}: {
  options: string[];
  onSelect?: (option: string) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowLeftGradient(scrollRef.current.scrollLeft > 0);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      // Check if content width exceeds container width
      setIsScrollable(scrollElement.scrollWidth > scrollElement.clientWidth);
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [options]); // Re-run when options change

  return (
    <div className="relative inline-block">
      {/* Left gradient only shows when scrolled and scrollable */}
      {showLeftGradient && isScrollable && (
        <div className="absolute -left-0 top-2 bottom-2 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {/* Right gradient only shows when scrollable */}
      {isScrollable && (
        <div className="absolute -right-0 top-2 bottom-2 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className={`flex py-2 relative ${
          isScrollable ? "overflow-x-auto" : "overflow-x-visible"
        }`}
      >
        <div className="flex space-x-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelectedOption(option);
                if (onSelect) onSelect(option);
              }}
              className={`
                whitespace-nowrap px-4 py-2 rounded-lg transition-all
                ${
                  selectedOption === option
                    ? "bg-primary-500 text-white"
                    : "bg-primary-50 text-primary-500 hover:bg-primary-200"
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableSelect;
