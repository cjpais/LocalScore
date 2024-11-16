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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowLeftGradient(scrollRef.current.scrollLeft > 0);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Left gradient only shows when scrolled */}
      {showLeftGradient && (
        <div className="absolute -left-0 top-2 bottom-2 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      <div className="absolute -right-0 top-2 bottom-2 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="flex overflow-x-auto py-2 relative">
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
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
