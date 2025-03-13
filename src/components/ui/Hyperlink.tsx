import Link from "next/link";
import React from "react";

const Hyperlink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: string;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={`text-primary-500 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
};

export default Hyperlink;
