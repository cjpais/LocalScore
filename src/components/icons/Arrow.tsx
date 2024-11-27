import React from "react";
const Arrow = ({
  className = "",
  color = "#000",
  direction = "down",
}: {
  className?: string;
  color?: string;
  direction?: "up" | "down";
}) => {
  const rotate = direction === "up" ? "rotate(180deg)" : "none";

  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: rotate }}
    >
      <path
        d="M3.646 11.854a.5.5 0 0 0 .708 0l3.182-3.182a.5.5 0 1 0-.708-.708L4 10.793 1.172 7.964a.5.5 0 1 0-.708.708zM3.5.5v11h1V.5z"
        fill={color}
      />
    </svg>
  );
};

export default Arrow;
