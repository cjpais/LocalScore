import AcceleratorInfo from "@/components/AcceleratorInfo";
import Card from "@/components/Card";
import ModelInfo from "@/components/ModelInfo";
import PerformanceMetricDisplay from "@/components/PerformanceMetricDisplay";
import Separator from "@/components/Separator";
import SystemInfo from "@/components/SystemInfo";
import { getBenchmarkResult } from "@/db/queries";
import { DetailedRun } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import React from "react";

const Page = ({ result }: { result: DetailedRun }) => {
  return (
    <div className="space-y-8">
      <Card className="flex flex-col gap-4">
        <div className="w-full">
          <div className="flex gap-2 text-2xl font-black tracking-wider justify-center">
            TEST #{result.id} RESULTS
          </div>
          <p className="text-center font-light pb-2">
            {dayjs(result.run_date).format("MM/DD/YYYY - h:mm A")}
          </p>

          <Separator thickness={2} />

          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="flex flex-col">
              <div className="flex gap-2 text-lg font-black tracking-wider">
                <p>ACCELERATOR</p>
              </div>

              <AcceleratorInfo
                id={result.accelerator_id}
                name={result.accelerator}
                type={result.accelerator_type}
                memory_gb={result.accelerator_memory_gb}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex gap-2 text-lg font-black tracking-wider">
                <p>MODEL</p>
              </div>
              <ModelInfo {...result.model} />
            </div>
          </div>

          <Separator thickness={2} />
        </div>

        <div className="flex justify-center w-full py-4">
          <div className="grid grid-cols-2 gap-8 gap-x-16 ">
            <PerformanceMetricDisplay
              label="generation"
              metricKey="avg_gen_tps"
              size="xl"
              value={result.avg_gen_tps}
            />
            <PerformanceMetricDisplay
              label="time to first token"
              metricKey="avg_ttft"
              size="xl"
              value={result.avg_ttft}
            />
            <PerformanceMetricDisplay
              label="prompt"
              metricKey="avg_prompt_tps"
              size="xl"
              value={result.avg_prompt_tps}
            />
            <PerformanceMetricDisplay
              label="LocalScore"
              metricKey="performance_score"
              size="xl"
              value={result.performance_score}
            />
          </div>
        </div>

        <Separator thickness={2} />

        <div>
          <div className="flex gap-2 text-xl font-black tracking-wider">
            SYSTEM
          </div>

          <SystemInfo systemInfo={result.system} extended />
        </div>

        <Separator thickness={2} />

        <div>
          <div className="flex gap-2 text-xl font-black tracking-wider">
            DETAILED RESULTS
          </div>
        </div>

        <Separator thickness={2} className="col-span-4" />

        <div className="w-full">
          <div className="w-full grid grid-cols-4 gap-2">
            <div className="font-medium text-sm">TEST NAME</div>
            <div className="font-medium text-sm">PROMPT</div>
            <div className="font-medium text-sm">GENERATIAON</div>
            <div className="font-medium text-sm">TTFT</div>

            <Separator thickness={2} className="col-span-4" />

            {result.results.map((result) => (
              <React.Fragment key={result.id}>
                <div>{result.name}</div>
                <div className="flex flex-row items-center gap-2">
                  <div className={`text-lg`}>
                    {
                      formatMetricValue("avg_prompt_tps", result.prompt_tps)
                        .formatted
                    }
                  </div>
                  <div className="text-xs">
                    {
                      formatMetricValue("avg_prompt_tps", result.prompt_tps)
                        .suffix
                    }
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className={`text-lg`}>
                    {formatMetricValue("avg_gen_tps", result.gen_tps).formatted}
                  </div>
                  <div className="text-xs">
                    {formatMetricValue("avg_gen_tps", result.gen_tps).suffix}
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className={`text-lg`}>
                    {formatMetricValue("avg_ttft", result.ttft_ms).formatted}
                  </div>
                  <div className="text-xs">
                    {formatMetricValue("avg_ttft", result.ttft_ms).suffix}
                  </div>
                </div>

                <Separator thickness={1} className="col-span-4" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const runId = parseInt(id as string);

  const result = await getBenchmarkResult(runId);

  return {
    props: {
      result,
    },
  };
};

export default Page;
