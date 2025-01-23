import React from "react";

interface SeparatorProps {
  thickness?: number;
  color?: string;
  className?: string;
  direction?: "horizontal" | "vertical";
}

const Separator = ({
  thickness = 1,
  color = "#EEECF5",
  className = "",
  direction = "horizontal",
}: SeparatorProps) => {
  const style: React.CSSProperties =
    direction === "horizontal"
      ? {
          borderTopWidth: `${thickness}px`,
          borderTopStyle: "solid",
          borderTopColor: color,
        }
      : {
          borderLeftWidth: `${thickness}px`,
          borderLeftStyle: "solid",
          borderLeftColor: color,
          height: "100%",
        };

  return <div className={`${className}`} style={style}></div>;
};

export default Separator;
