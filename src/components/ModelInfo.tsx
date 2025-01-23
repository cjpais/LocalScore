import { Model } from "@/lib/types";
import { getModelParamsString } from "@/lib/utils";
import Link from "next/link";

type ModelInfoProps = Model & {
  variant?: "standard" | "xl";
};

const ModelInfo: React.FC<ModelInfoProps> = ({
  name,
  quant,
  variantId,
  variant = "standard",
  params,
}) => (
  <div className="grid grid-cols-5">
    <Link
      href={`/model/${variantId}`}
      className="col-span-4 text-primary-500 hover:underline"
    >
      <p
        className={`font-medium ${variant === "xl" ? "text-2xl" : "text-base"}`}
      >
        {name}
      </p>
      <p className={`-mt-1 ${variant === "xl" ? "text-lg" : "text-sm"}`}>
        {quant}
      </p>
    </Link>
    <div className="flex flex-col justify-center">
      <span
        className={`font-medium ${variant === "xl" ? "text-2xl" : "text-base"}`}
      >
        {getModelParamsString(params)}
      </span>
      <span
        className={`${
          variant === "xl" ? "text-lg" : "text-sm"
        } font-light -mt-1`}
      >
        params
      </span>
    </div>
  </div>
);

export default ModelInfo;
