import Button from "@/components/ui/Button";
import { TabContent } from "@/components/ui/Tab";
import React from "react";
import TabStepLabel from "./TabStepLabel";
import CodeBlock from "@/components/ui/CodeBlock";
import TabStep from "./TabStep";
import OperatingSystemSelector from "./OperatingSystemSelector";
import { useDownloadStore } from "@/lib/hooks/useDownload";
import Hyperlink from "@/components/ui/Hyperlink";
import { LOCALSCORE_VERSION } from "@/lib/config";

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
        <Button className="w-full">
          <Hyperlink
            href={`https://blob.localscore.ai/localscore-${LOCALSCORE_VERSION}${
              isWindows ? ".exe" : ""
            }`}
            className="flex justify-center font-medium text-xl w-full"
          >
            Download LocalScore
          </Hyperlink>
        </Button>
      </TabStep>

      <TabStep>
        <TabStepLabel>Run LocalScore on a model</TabStepLabel>
        {isWindows ? (
          <></>
        ) : (
          <CodeBlock className="w-full">
            <p>chmod +x localscore</p>
            <p>./localscore -m path/to/model</p>
          </CodeBlock>
        )}
      </TabStep>
    </TabContent>
  );
};

export default ModelTab;
