import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  elevation = "none",
  hover = false,
}) => {
  const elevationClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const hoverClasses = hover
    ? "hover:shadow-md transition-shadow duration-300"
    : "";

  return (
    <div
      className={`bg-primary-100 dark:bg-[#eeecf5] p-5 rounded-md ${elevationClasses[elevation]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
