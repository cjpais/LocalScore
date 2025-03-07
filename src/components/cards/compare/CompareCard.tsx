import React, { useState, ReactNode } from "react";
import MetricSelector from "@/components/display/MetricSelector";
import { PerformanceMetricKey } from "@/lib/types";
import {
  CompareCardContainer,
  CompareCardSection,
  CompareChartContainer,
  CompareSectionTitle,
} from "./CompareCardComponents";

interface CompareCardProps<T, U> {
  headerText: string;
  itemCount: number;
  itemsLabel: string;
  selectorTitle: string;
  selectedKey: PerformanceMetricKey;
  setSelectedKey: (key: PerformanceMetricKey) => void;
  titleContent: ReactNode;
  selectorComponent: ReactNode;
  chartComponent: ReactNode;
}

function CompareCard<T, U>({
  headerText,
  itemCount,
  itemsLabel,
  selectorTitle,
  selectedKey,
  setSelectedKey,
  titleContent,
  selectorComponent,
  chartComponent,
}: CompareCardProps<T, U>) {
  return (
    <CompareCardContainer
      headerText={headerText}
      headerRightContent={
        <p>
          {itemCount} {itemsLabel} tested
        </p>
      }
    >
      <CompareCardSection>
        <CompareSectionTitle title={selectorTitle} />
        {selectorComponent}
      </CompareCardSection>

      <div className="flex flex-col items-center justify-center">
        <CompareCardSection className="items-center gap-2">
          {titleContent}
          <div className="flex items-center max-w-64 w-full">
            <MetricSelector
              selectedKey={selectedKey}
              onChange={setSelectedKey}
            />
          </div>
        </CompareCardSection>

        <CompareChartContainer>{chartComponent}</CompareChartContainer>
      </div>
    </CompareCardContainer>
  );
}

export default CompareCard;
