import React from "react";
import Image from "next/image";
import { Accelerator } from "@/lib/types";

const AcceleratorSelectOptionLabel = ({
  acc,
  variant = "default",
}: {
  acc: Accelerator;
  variant?: "header" | "default";
}) => {
  const isDefault = variant === "default";
  const textClasses = isDefault ? "font-light text-sm" : "font-normal text-lg";

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Image
          src="/accel.svg"
          width={isDefault ? 16 : 20}
          height={isDefault ? 16 : 20}
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
