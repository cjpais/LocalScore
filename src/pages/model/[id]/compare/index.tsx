import Card from "@/components/Card";
import ModelMetricsChart from "@/components/charts/ModelMetrics";
import Carat from "@/components/icons/Carat";
import {
  getPerformanceScores,
  getTopAcceleratorsByModelVariants,
} from "@/db/queries";
import { OFFICIAL_ACCELERATORS } from "@/lib/config";
import {
  Accelerator,
  MetricLabels,
  MetricSortDirection,
  PerformanceMetricKey,
  PerformanceScore,
  sortableResultKeys,
  UniqueAccelerator,
} from "@/lib/types";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import Select, { MultiValue } from "react-select";

interface AcceleratorSelectProps {
  accelerators: Accelerator[];
  onChange: (selectedAccelerators: Accelerator[]) => void;
  defaultValue?: UniqueAccelerator[]; // Optional default value
}

interface SelectOption {
  value: string;
  label: string;
  accelerator: Accelerator;
}

const AcceleratorSelect: React.FC<AcceleratorSelectProps> = ({
  accelerators,
  onChange,
  defaultValue = [],
}) => {
  // Helper function to find matching accelerator from the full list
  const findMatchingAccelerator = (
    uniqueAcc: UniqueAccelerator
  ): Accelerator | undefined => {
    return accelerators.find(
      (acc) => acc.name === uniqueAcc.name && acc.memory_gb === uniqueAcc.memory
    );
  };

  // Convert accelerators to react-select options format
  const options: SelectOption[] = accelerators.map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.type}) - ${acc.memory_gb}GB`,
    accelerator: acc,
  }));

  // Convert default value to react-select format, filtering out any unmatched accelerators
  const defaultOptions: SelectOption[] = defaultValue
    .map((uniqueAcc) => {
      const matchedAcc = findMatchingAccelerator(uniqueAcc);
      if (!matchedAcc) return null;

      return {
        value: matchedAcc.id,
        label: `${matchedAcc.name} (${matchedAcc.type}) - ${matchedAcc.memory_gb}GB`,
        accelerator: matchedAcc,
      };
    })
    .filter((option): option is SelectOption => option !== null);

  const handleChange = (selectedOptions: MultiValue<SelectOption>) => {
    const selected = selectedOptions.map((option) => option.accelerator);
    onChange(selected);
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "40px",
      border: "1px solid #ddd",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#007bff" : "white",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    }),
  };

  return (
    <Select
      isMulti
      options={options}
      defaultValue={defaultOptions}
      onChange={handleChange}
      className="accelerator-select"
      placeholder="Select accelerators..."
      classNamePrefix="select"
      styles={customStyles}
    />
  );
};

const Index = ({ result }: { result: PerformanceScore | null }) => {
  const [selectedKey, setSelectedKey] =
    useState<PerformanceMetricKey>("avg_gen_tps");
  const [selectedAccelerators, setSelectedAccelerators] = useState<
    UniqueAccelerator[]
  >(OFFICIAL_ACCELERATORS);

  if (!result) {
    return <div>Model not found</div>;
  }

  const selectedResults = {
    ...result,
    results:
      result.results.filter((r) =>
        selectedAccelerators.some(
          (acc) =>
            acc.name === r.accelerator_name &&
            acc.memory === r.accelerator_memory_gb.toString()
        )
      ).length === 0
        ? result.results.slice(0, 10)
        : result.results.filter((r) =>
            selectedAccelerators.some(
              (acc) =>
                acc.name === r.accelerator_name &&
                acc.memory === r.accelerator_memory_gb.toString()
            )
          ),
  };

  return (
    <>
      <AcceleratorSelect
        accelerators={result.results.map((r) => ({
          id: r.accelerator_id,
          name: r.accelerator_name,
          type: r.accelerator_type,
          memory_gb: r.accelerator_memory_gb.toString(),
          created_at: null,
          manufacturer: null,
        }))}
        onChange={(accels) =>
          setSelectedAccelerators(
            accels.map((a) => ({
              name: a.name,
              memory: a.memory_gb,
            }))
          )
        }
        defaultValue={selectedAccelerators}
      />
      <Card>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">Compare</p>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) =>
                setSelectedKey(e.target.value as PerformanceMetricKey)
              }
              className="px-5 py-[10px] text-primary-500 bg-primary-100 border-none appearance-none rounded-md"
            >
              {sortableResultKeys.map((key) => (
                <option key={key} value={key}>
                  {MetricLabels[key]}
                </option>
              ))}
            </select>
            <Carat className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <ModelMetricsChart
          data={[selectedResults]}
          selectedModel={result.model}
          metricKey={selectedKey}
          sortDirection={MetricSortDirection[selectedKey]}
        />
      </Card>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  console.log(id);

  const modelVariantIds = [id as string];

  const acceleratorIds = await getTopAcceleratorsByModelVariants({
    modelVariantIds,
    numResults: 500,
  });

  const results = await getPerformanceScores(acceleratorIds, modelVariantIds);
  console.log("Added string", results);

  return {
    props: {
      result: results[0] || null,
    },
  };
};

export default Index;
