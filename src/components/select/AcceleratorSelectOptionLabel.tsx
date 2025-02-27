import React from "react";
import Image from "next/image";
import { Accelerator } from "@/lib/types";

const AcceleratorSelectOptionLabel = ({ acc }: { acc: Accelerator }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <div className="flex gap-2">
          <Image
            src="/accel.svg"
            width={16}
            height={16}
            alt="a small icon of a computer chip"
          />
          <p>{acc.name}</p>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <p className="font-light text-sm">{acc.memory_gb}GB</p>
        <p>•</p>
        <p className="text-sm font-light">{acc.type}</p>
      </div>
    </div>
  );
};

export default AcceleratorSelectOptionLabel;
