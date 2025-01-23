import { Accelerator } from "@/lib/types";
import Link from "next/link";

interface AcceleratorInfoProps extends Partial<Accelerator> {
  variant?: "standard" | "xl";
}

const AcceleratorInfo: React.FC<AcceleratorInfoProps> = ({
  id,
  name,
  type,
  memory_gb,
  variant = "standard",
}) => {
  const isXL = variant === "xl";
  return (
    <div className="grid grid-cols-5 w-full">
      <div className="flex flex-col col-span-4">
        <Link
          className={`${
            isXL ? "text-2xl" : ""
          } font-medium text-primary-500 hover:underline`}
          href={`/accelerator/${id}`}
        >
          {name}
        </Link>
        <div className={`${isXL ? "text-lg" : "text-sm"} font-light -mt-1`}>
          {type}
        </div>
      </div>
      <div className="flex flex-col">
        <div className={`${isXL ? "text-2xl" : ""} font-medium`}>
          {memory_gb}
        </div>
        <div className={`${isXL ? "text-lg" : "text-sm"} font-light -mt-1`}>
          GB
        </div>
      </div>
    </div>
  );
};

export default AcceleratorInfo;
