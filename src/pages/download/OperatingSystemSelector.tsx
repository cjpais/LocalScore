import React from "react";
import { useDownloadStore } from "./useDownload";

const OperatingSystemSelector = () => {
  const { operatingSystem, setOperatingSystem } = useDownloadStore();

  const baseStyles = "font-medium rounded-lg px-5 py-[10px]";
  const activeStyles = "border-2 border-primary-500";

  const isWindows = operatingSystem === "Windows";

  return (
    <div className="flex gap-2">
      <button
        className={`${baseStyles} ${
          !isWindows
            ? activeStyles
            : "border-2 border-primary-200 hover:bg-primary-100"
        }`}
        onClick={() => setOperatingSystem("MacOS/Linux")}
      >
        MacOS/Linux
      </button>
      <button
        className={`${baseStyles} ${
          isWindows
            ? activeStyles
            : "border-2 border-primary-200 hover:bg-primary-100"
        }`}
        onClick={() => setOperatingSystem("Windows")}
      >
        Windows
      </button>
    </div>
  );
};

export default OperatingSystemSelector;
