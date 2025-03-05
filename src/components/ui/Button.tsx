import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  ...props
}) => {
  const defaultClasses =
    "px-4 py-2 bg-primary-100 text-primary-500 hover:text-white hover:bg-primary-500 rounded";
  const combinedClasses = className
    ? `${defaultClasses} ${className}`
    : defaultClasses;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
