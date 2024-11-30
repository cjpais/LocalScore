import React from "react";
import Separator from "./Separator";

const PageHeader = ({ text }: { text: string }) => {
  return (
    <div>
      <p className="flex gap-2 text-2xl font-semibold tracking-wide">{text}</p>
      <Separator thickness={2} />
    </div>
  );
};

export default PageHeader;
