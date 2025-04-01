import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, Tab } from "@/components/ui/Tab";
import { OperatingSystem } from "@/lib/types";
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import OfficialTab from "./OfficialTab";
import ModelTab from "./ModelTab";
import { useDownloadStore } from "../../lib/hooks/useDownload";
import Hyperlink from "@/components/ui/Hyperlink";

const Download = ({ os }: { os: OperatingSystem }) => {
  const { setOperatingSystem } = useDownloadStore();

  useEffect(() => {
    setOperatingSystem(os);
  }, [os, setOperatingSystem]);

  return (
    <>
      <Meta
        title="Download LocalScore"
        description="Download the LocalScore benchmark"
      />
      <PageHeader>Download LocalScore</PageHeader>
      <p>
        There are two ways to run LocalScore. The easiest way to get started is
        to download one of the Official Models. If you have .gguf models already
        you run LocalScore with them.
      </p>

      <PageHeader>Run With</PageHeader>

      <Tabs className="">
        <Tab label="Official Models">
          <OfficialTab />
        </Tab>
        <Tab label="Your own .gguf">
          <ModelTab />
        </Tab>
      </Tabs>

      <div className="text-center">
        <p>
          Having issues with the CLI client? Check out the{" "}
          <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile/localscore/doc/troubleshooting.md">
            troubleshooting guide.
          </Hyperlink>{" "}
        </p>
        <p>
          For further documentation on the LocalScore CLI, check out the{" "}
          <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile/localscore/README.md">
            README
          </Hyperlink>
        </p>
      </div>

      <div className="p-6 w-full flex flex-col items-center">
        <div className="font-medium">need help? check out this video</div>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=WbCmBwmN74Pnya5A"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get user-agent from request headers
  const userAgent = context.req.headers["user-agent"] || "";

  // Detect OS from user agent
  let detectedOS = "MacOS/Linux";

  if (userAgent.indexOf("Win") !== -1) detectedOS = "Windows";

  return {
    props: {
      os: detectedOS,
    },
  };
};

export default Download;
