import React from "react";
import Image from "next/image";
import { Accelerator } from "@/lib/types";

const AcceleratorSelectOptionLabel = ({
  acc,
  isFocused,
}: {
  acc: Accelerator;
  isFocused: boolean;
}) => {
  const textClasses = "font-light text-sm";

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Image
          src={isFocused ? "/accel-focus.svg" : "/accel.svg"}
          width={16}
          height={16}
          alt="a small icon of a computer chip"
        />
        <p>{acc.name}</p>
      </div>
      <div className="flex gap-2 items-center">
        <p className={textClasses}>{acc.memory_gb}GB</p>
        <p>•</p>
        <p className={textClasses}>{acc.type}</p>
      </div>
    </div>
  );
};

export default AcceleratorSelectOptionLabel;
