import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-md shadow-[0_24px_54px_0_rgba(88,42,203,0.03)] px-5 py-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
