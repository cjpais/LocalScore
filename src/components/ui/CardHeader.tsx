import React from "react";

const CardHeader = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex gap-2 sm:text-2xl text-xl font-black tracking-wider ${className}`}
    >
      {text}
    </div>
  );
};

export default CardHeader;
