import React from "react";
import Image from "next/image";
import { Model } from "@/lib/types";

const ModelSelectOptionLabel = ({
  model,
  isFocused,
}: {
  model: Model;
  isFocused: boolean;
}) => {
  const textClasses = "font-light text-sm";

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Image
          src={isFocused ? "/model-focus.svg" : "/model.svg"}
          width={16}
          height={16}
          alt="a small icon of a model"
        />
        <p>{model.name}</p>
      </div>
      <p className={textClasses}>{model.quant}</p>
    </div>
  );
};

export default ModelSelectOptionLabel;
