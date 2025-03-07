import { Run } from "@/lib/types";
import Card from "../ui/Card";
import Link from "next/link";
import dayjs from "dayjs";
import Separator from "../ui/Separator";
import AcceleratorInfo from "../display/AcceleratorInfo";
import ModelInfo from "../display/ModelInfo";
import SystemInfo from "../display/SystemInfo";
import PerformanceResultsGrid from "../display/PerformanceResultsGrid";

const LatestRunHeader = ({ run }: { run: Run }) => (
  <div className="flex flex-col justify-between pb-1">
    <div className="flex justify-between">
      <Link
        href={`/result/${run.id}`}
        className="text-primary-500 hover:underline text-sm font-medium"
      >
        Test #{run.id}
      </Link>
      <p className="text-sm text-gray-600 font-light">
        {dayjs(run.run_date).format("MM/DD/YYYY - h:mm A")}
      </p>
    </div>
  </div>
);

const LatestRunBody = ({ run }: { run: Run }) => (
  <div className="flex flex-col md:grid md:grid-cols-[repeat(16,minmax(0,1fr))] py-1.5">
    <div className="flex md:flex-col sm:flex-row flex-col col-span-9 justify-center gap-1 pr-2">
      <AcceleratorInfo
        id={run.accelerator_id}
        name={run.accelerator}
        type={run.accelerator_type}
        memory_gb={run.accelerator_memory_gb}
      />

      <Separator thickness={2} direction="vertical" className="md:hidden" />

      <ModelInfo {...run.model} />
    </div>
    <Separator
      thickness={2}
      direction="vertical"
      className="justify-end self-end hidden md:flex"
    />
    <Separator
      thickness={2}
      direction="horizontal"
      className="block md:hidden my-2"
    />
    <PerformanceResultsGrid run={run} />
  </div>
);

const LatestRunCard: React.FC<{ run: Run }> = ({ run }) => (
  <Card className="flex flex-col">
    <LatestRunHeader run={run} />
    <Separator thickness={2} className="pb-2" />
    <LatestRunBody run={run} />
    <Separator thickness={2} className="mt-2" />
    <SystemInfo systemInfo={run.system} />
  </Card>
);

export default LatestRunCard;
