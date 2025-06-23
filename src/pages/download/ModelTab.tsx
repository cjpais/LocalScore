import Button from "@/components/ui/Button";
import { TabContent } from "@/components/ui/Tab";
import React from "react";
import TabStepLabel from "./TabStepLabel";
import CodeBlock from "@/components/ui/CodeBlock";
import TabStep from "./TabStep";
import OperatingSystemSelector from "./OperatingSystemSelector";
import { useDownloadStore } from "@/lib/hooks/useDownload";
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
        <Button className="w-full !hover:text-white">
          <a
            href={`https://blob.localscore.ai/localscore-${LOCALSCORE_VERSION}${
              isWindows ? ".exe" : ""
            }`}
            className="flex justify-center font-medium text-xl w-full"
          >
            Download LocalScore
          </a>
        </Button>
      </TabStep>

      <TabStep>
        <TabStepLabel>
          {isWindows ? "Open cmd.exe and run:" : "Open your terminal and run:"}
        </TabStepLabel>
        {isWindows ? (
          <CodeBlock className="w-full">
            {`localscore-${LOCALSCORE_VERSION}.exe -m path\\to\\model.gguf`}
          </CodeBlock>
        ) : (
          <CodeBlock className="w-full">
            {`chmod +x localscore-${LOCALSCORE_VERSION}
./localscore-${LOCALSCORE_VERSION} -m path/to/model.gguf`}
          </CodeBlock>
        )}
      </TabStep>
    </TabContent>
  );
};

export default ModelTab;
