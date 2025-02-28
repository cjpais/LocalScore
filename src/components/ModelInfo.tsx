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
    <div className="grid grid-cols-12 w-full items-center">
      <Image
        src="/model.svg"
        width={isHeader ? 36 : 20}
        height={isHeader ? 36 : 20}
        alt="model icon"
        className="col-span-1"
      />
      <div className={`flex w-full col-span-9 ${isHeader ? "gap-4" : "gap-2"}`}>
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
        className={`flex flex-col justify-center col-span-2 ${
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
