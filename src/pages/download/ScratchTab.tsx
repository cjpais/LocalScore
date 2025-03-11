import { Tab, TabContent, Tabs } from "@/components/ui/Tab";
import { OFFICIAL_MODELS } from "@/lib/config";
import React, { useState } from "react";
import TabStepLabel from "./TabStepLabel";
import CodeBlock from "@/components/ui/CodeBlock";
import { useDownloadStore } from "./useDownload";
import Button from "@/components/ui/Button";
import TabStep from "./TabStep";
import OperatingSystemSelector from "./OperatingSystemSelector";

const ModelSelector = () => {
  const { setSelectedModelIndex, selectedModelIndex } = useDownloadStore();

  return (
    <div className="flex justify-between gap-4">
      {OFFICIAL_MODELS.map((m, i) => (
        <button
          className={`border-2 rounded-md px-5 py-[10px] ${
            selectedModelIndex === i
              ? "border-primary-500"
              : "border-primary-200 hover:bg-primary-100"
          }`}
          key={i}
          onClick={() => setSelectedModelIndex(i)}
        >
          <div className="font-medium text-xl">{m.params}</div>
          <div className="font-medium">{m.shortName}</div>
          <div className="text-sm">{m.quant}</div>
          <div className="text-xs">requires: ~{m.vram} memory</div>
        </button>
      ))}
    </div>
  );
};

const ScratchTab = () => {
  const { selectedModel, operatingSystem, setOperatingSystem } =
    useDownloadStore();

  const activeOSTab = operatingSystem === "Windows" ? 0 : 1;

  return (
    <TabContent>
      <TabStep>
        <TabStepLabel>What OS are you running?</TabStepLabel>
        <OperatingSystemSelector />
      </TabStep>
      <TabStep>
        <TabStepLabel>Select the model you want to benchmark</TabStepLabel>
        <ModelSelector />
      </TabStep>
      <TabStep>
        <TabStepLabel>
          Download LocalScore for {selectedModel.name}
        </TabStepLabel>
        <Button>
          download {selectedModel.shortName}.localscore
          {/* TODO on windows download as .exe directly???? */}
        </Button>
      </TabStep>
      <TabStep>
        <TabStepLabel>
          Open terminal in your download location and run:
        </TabStepLabel>
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
            <CodeBlock>
              <p>localscore -m "{selectedModel.name}"</p>
            </CodeBlock>
            Note on windows... shit can be a bit fucked.
          </Tab>
          <Tab label="MacOS/Linux">
            <CodeBlock>
              <p>chmod +x localscore</p>
              <p>./localscore -m "{selectedModel.name}"</p>
            </CodeBlock>
          </Tab>
        </Tabs>
      </TabStep>
      <p>you should see something like:</p>
    </TabContent>
  );
};

export default ScratchTab;
