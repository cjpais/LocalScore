import React from "react";

const Separator = ({ thickness = 1, color = "#EEECF5", className = "" }) => {
  return (
    <div
      className={`${className}`}
      style={{
        borderTopWidth: `${thickness}px`,
        borderTopStyle: "solid",
        borderTopColor: color,
      }}
    ></div>
  );
};

export default Separator;
