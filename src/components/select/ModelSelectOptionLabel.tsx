import React from "react";
import Image from "next/image";
import { Model } from "@/lib/types";

const ModelSelectOptionLabel = ({ model }: { model: Model }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Image
          src="/model.svg"
          width={16}
          height={16}
          alt="a small icon of a model"
        />
        <p>{model.name}</p>
      </div>
      <p className="text-sm font-light">{model.quant}</p>
    </div>
  );
};

export default ModelSelectOptionLabel;
