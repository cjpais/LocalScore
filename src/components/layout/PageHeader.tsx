import React from "react";
import Separator from "../ui/Separator";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="md:text-2xl text-xl font-semibold tracking-wide pb-2">
        {children}
      </div>
      <Separator thickness={2} />
    </div>
  );
};

export default PageHeader;
