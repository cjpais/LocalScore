import { Accelerator } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

interface AcceleratorInfoProps extends Partial<Accelerator> {
  variant?: "standard" | "header";
}

const AcceleratorInfo: React.FC<AcceleratorInfoProps> = ({
  id,
  name,
  type,
  memory_gb,
  variant = "standard",
}) => {
  const isHeader = variant === "header";
  return (
    <div className="grid grid-cols-5 w-full">
      <div className={`flex w-full col-span-4 ${isHeader ? "gap-4" : "gap-2"}`}>
        <Image
          src="/accel.svg"
          width={isHeader ? 36 : 20}
          height={isHeader ? 36 : 20}
          alt="Accelerator icon"
        />
        <div className="flex flex-col">
          {isHeader ? (
            <div className="font-medium">{name}</div>
          ) : (
            <Link
              className="font-medium text-primary-500 hover:underline"
              href={`/accelerator/${id}`}
            >
              {name}
            </Link>
          )}

          <div
            className={`${isHeader ? "text-base" : "text-sm"} font-light -mt-1`}
          >
            {type}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col justify-center ${
          isHeader ? "items-end" : ""
        }`}
      >
        <div className={`font-medium ${isHeader && "text-lg"}`}>
          {memory_gb}
        </div>
        <div
          className={`${isHeader ? "text-base" : "text-sm"} font-light -mt-1`}
        >
          GB
        </div>
      </div>
    </div>
  );
};

export default AcceleratorInfo;
