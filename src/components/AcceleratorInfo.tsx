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
    <div className="grid grid-cols-12 w-full items-center">
      <Image
        src="/accel.svg"
        width={isHeader ? 36 : 20}
        height={isHeader ? 36 : 20}
        alt="Accelerator icon"
        className="col-span-1 w-6 md:w-9"
      />
      <div className={`flex w-full col-span-9 ${isHeader ? "gap-4" : "gap-2"}`}>
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
            className={`${
              isHeader ? "md:text-base text-sm" : "text-sm"
            } font-light -mt-1`}
          >
            {type}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col justify-center col-span-2 ${
          isHeader ? "items-end" : ""
        }`}
      >
        <div className={`font-medium ${isHeader && "md:text-lg text-base"}`}>
          {memory_gb}
        </div>
        <div
          className={`${
            isHeader ? "md:text-base text-sm" : "text-sm"
          } font-light -mt-1`}
        >
          GB
        </div>
      </div>
    </div>
  );
};

export default AcceleratorInfo;
