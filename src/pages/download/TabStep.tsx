import React from "react";

const TabStep = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};

export default TabStep;
