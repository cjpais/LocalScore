import React from "react";

const Carat = ({
  strokeWidth = 3,
  className = "",
}: {
  strokeWidth?: number;
  className?: string;
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth={strokeWidth}
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export default Carat;
