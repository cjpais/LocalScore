import React from "react";

const Carat = ({
  strokeWidth = 3,
  className = "",
  stroke = "#582acb",
}: {
  strokeWidth?: number;
  className?: string;
  stroke?: string;
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
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
