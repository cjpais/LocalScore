import Link from "next/link";
import React, { ReactNode } from "react";

const Hyperlink = ({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "button";
}) => {
  const primaryClasses = "text-primary-500 hover:underline";
  const buttonClasses =
    "px-4 py-2 bg-primary-100 text-primary-500 hover:text-white hover:bg-primary-500 rounded";

  const classes =
    variant === "primary"
      ? `${primaryClasses} ${className}`
      : `${buttonClasses} ${className}`;

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
};

export default Hyperlink;
