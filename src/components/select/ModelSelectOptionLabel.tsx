import React from "react";
import Image from "next/image";
import { Model } from "@/lib/types";

const ModelSelectOptionLabel = ({
  model,
  variant = "default",
}: {
  model: Model;
  variant?: "header" | "default";
}) => {
  const isDefault = variant === "default";
  const textClasses = isDefault ? "font-light text-sm" : "font-normal text-lg";

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Image
          src="/model.svg"
          width={isDefault ? 16 : 24}
          height={isDefault ? 16 : 24}
          alt="a small icon of a model"
        />
        <p>{model.name}</p>
      </div>
      <p className={textClasses}>{model.quant}</p>
    </div>
  );
};

export default ModelSelectOptionLabel;
