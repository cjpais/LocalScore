import { Runtime } from "@/lib/types";
import React from "react";

interface RuntimeInfoProps {
  runtime: Runtime;
}

const RuntimeInfo: React.FC<RuntimeInfoProps> = ({ runtime }) => {
  return (
    <div className="grid grid-cols-3 gap-1 text-xs sm:text-sm mt-2">
      <div className="md:col-span-1 col-span-5 flex items-center gap-1">
        <div className="font-light">Name</div>
        <div className="font-medium">{runtime.name}</div>
      </div>

      {runtime.version && (
        <div className="md:col-span-1 col-span-5 flex items-center gap-1 justify-center">
          <div className="font-light">Version</div>
          <div className="font-medium">{runtime.version}</div>
        </div>
      )}

      {runtime.commit_hash && (
        <div className="md:col-span-1 col-span-5 flex items-center gap-1 justify-end">
          <div className="font-light">Commit Hash</div>
          <div className="font-medium">{runtime.commit_hash}</div>
        </div>
      )}
    </div>
  );
};

export default RuntimeInfo;
