import Button from "@/components/ui/Button";
import { TabContent } from "@/components/ui/Tab";
import React from "react";
import TabStepLabel from "./TabStepLabel";
import CodeBlock from "@/components/ui/CodeBlock";
import TabStep from "./TabStep";
import OperatingSystemSelector from "./OperatingSystemSelector";
import { useDownloadStore } from "@/lib/hooks/useDownload";

const ModelTab = () => {
  const { operatingSystem } = useDownloadStore();

  const isWindows = operatingSystem === "Windows";

  return (
    <TabContent>
      <TabStep>
        <TabStepLabel>What OS are you running?</TabStepLabel>
        <OperatingSystemSelector />
      </TabStep>
      <TabStep>
        <TabStepLabel>Download LocalScore Runtime</TabStepLabel>
        <Button className="w-full">
          <a
            href={`https://github.com/Mozilla-Ocho/llamafile/releases/download/0.9.1/llamafile-0.9.1${
              isWindows ? ".exe" : ""
            }`}
          >
            Download LocalScore
          </a>
        </Button>
      </TabStep>

      <TabStep>
        <TabStepLabel>Run LocalScore on a model</TabStepLabel>
        <CodeBlock className="w-full">
          <p>chmod +x localscore</p>
          <p>./localscore -m path/to/model</p>
        </CodeBlock>
      </TabStep>
    </TabContent>
  );
};

export default ModelTab;
