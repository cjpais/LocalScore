import React from "react";
import Separator from "./Separator";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="text-2xl font-semibold tracking-wide pb-2">
        {children}
      </div>
      <Separator thickness={2} />
    </div>
  );
};

export default PageHeader;
