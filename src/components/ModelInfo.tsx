import { Model } from "@/lib/types";
import { getModelParamsString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type ModelInfoProps = Model & {
  variant?: "standard" | "header";
};

const ModelInfo = ({
  name,
  quant,
  variantId,
  variant = "standard",
  params,
}: ModelInfoProps) => {
  const isHeader = variant === "header";

  return (
    <div className="grid grid-cols-5 w-full">
      <div className={`flex w-full col-span-4 ${isHeader ? "gap-4" : "gap-2"}`}>
        <Image
          src="/model.svg"
          width={isHeader ? 36 : 20}
          height={isHeader ? 36 : 20}
          alt="model icon"
        />

        {variant === "standard" ? (
          <Link
            href={`/model/${variantId}`}
            className="text-primary-500 hover:underline"
          >
            <p className="font-medium">{name}</p>
            <p className="-mt-1 text-sm">{quant}</p>
          </Link>
        ) : (
          <div>
            <p className="font-medium text-2xl">{name}</p>
            <p
              className={`${
                isHeader ? "text-base" : "text-sm"
              } font-light -mt-1`}
            >
              {quant}
            </p>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col justify-center ${
          isHeader ? "items-end" : ""
        }`}
      >
        <span
          className={`font-medium ${
            variant === "header" ? "text-lg" : "text-base"
          }`}
        >
          {getModelParamsString(params)}
        </span>
        <span
          className={`${
            variant === "header" ? "text-base" : "text-sm"
          } font-light -mt-1`}
        >
          params
        </span>
      </div>
    </div>
  );
};

export default ModelInfo;
