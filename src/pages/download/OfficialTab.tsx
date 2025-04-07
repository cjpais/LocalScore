import { Tab, TabContent, Tabs } from "@/components/ui/Tab";
import { LOCALSCORE_VERSION, OFFICIAL_MODELS } from "@/lib/config";
import React from "react";
import TabStepLabel from "./TabStepLabel";
import CodeBlock from "@/components/ui/CodeBlock";
import { useDownloadStore } from "../../lib/hooks/useDownload";
import TabStep from "./TabStep";
import OperatingSystemSelector from "./OperatingSystemSelector";
import Hyperlink from "@/components/ui/Hyperlink";

const ModelSelector = () => {
  const { setSelectedModelIndex, selectedModelIndex } = useDownloadStore();

  return (
    <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2 md:gap-4">
      {OFFICIAL_MODELS.map((m, i) => (
        <button
          className={`border-2 rounded-md px-3 py-2 md:px-5 md:py-[10px] w-full sm:w-[calc(50%-0.5rem)] ${
            selectedModelIndex === i
              ? "border-primary-500"
              : "border-primary-200 hover:bg-primary-100"
          }`}
          key={i}
          onClick={() => setSelectedModelIndex(i)}
        >
          <div className="font-medium text-lg md:text-xl">
            {m.humanLabel} - {m.params}
          </div>
          <div className="text-xs">requires: ~{m.vram} memory</div>
        </button>
      ))}
    </div>
  );
};

const OfficialTab = () => {
  const { selectedModel, operatingSystem, setOperatingSystem } =
    useDownloadStore();

  const isWindows = operatingSystem === "Windows";
  const activeOSTab = isWindows ? 0 : 1;

  const selectedModelFilename = `localscore-${selectedModel.humanLabel.toLowerCase()}`;

  return (
    <TabContent>
      <TabStep>
        <TabStepLabel>What OS are you running?</TabStepLabel>
        <OperatingSystemSelector />
      </TabStep>
      <TabStep>
        <TabStepLabel>Select the benchmark you want to run:</TabStepLabel>
        <ModelSelector />
      </TabStep>
      {isWindows && (
        <>
          <TabStep>
            <div className="w-full flex items-center gap-3">
              <TabStepLabel>1.</TabStepLabel>
              <Hyperlink
                variant="button"
                href={`https://blob.localscore.ai/localscore-${LOCALSCORE_VERSION}.exe`}
                className="flex justify-center font-medium text-xl w-full"
              >
                Download LocalScore
              </Hyperlink>
            </div>
          </TabStep>
          <TabStep>
            <div className="w-full flex items-center gap-3">
              <TabStepLabel>2.</TabStepLabel>
              <Hyperlink
                variant="button"
                href={selectedModel.hfDownload}
                className="flex justify-center font-medium text-xl w-full"
              >
                Download {selectedModel.hfName}
              </Hyperlink>
            </div>
          </TabStep>
        </>
      )}
      <TabStep>
        {!isWindows && <TabStepLabel>Open your terminal and run:</TabStepLabel>}
        <Tabs
          style="invisible"
          activeTabIndex={activeOSTab}
          onTabChange={(i) =>
            i == 0
              ? setOperatingSystem("Windows")
              : setOperatingSystem("MacOS/Linux")
          }
        >
          <Tab label="Windows">
            <div className="ml-6">
              <TabStepLabel>Open cmd.exe and run:</TabStepLabel>
            </div>
            <div className="w-full items-center flex gap-3">
              <TabStepLabel>3.</TabStepLabel>
              <CodeBlock className="w-full">
                {`localscore-${LOCALSCORE_VERSION}.exe -m ${selectedModel.hfFilename}`}
              </CodeBlock>
            </div>
          </Tab>
          <Tab label="MacOS/Linux">
            <CodeBlock className="">
              {`curl -OL https://localscore.ai/download/${selectedModelFilename}
chmod +x ${selectedModelFilename}
./${selectedModelFilename}`}
            </CodeBlock>
          </Tab>
        </Tabs>
      </TabStep>
    </TabContent>
  );
};

export default OfficialTab;
