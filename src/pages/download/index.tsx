import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, Tab } from "@/components/ui/Tab";
import { OperatingSystem } from "@/lib/types";
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import OfficialTab from "./OfficialTab";
import ModelTab from "./ModelTab";
import { useDownloadStore } from "../../lib/hooks/useDownload";

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
        Download LocalScore, run it on your computer and contribute your results
        to the commons!
      </p>
      <p>
        There are 2 primary ways to run LocalScore. For people who just getting
        started in local AI the easiest way to get running is to download one of
        the official models. For people who are more familiar with local AI,
        maybe have played with llama.cpp, ollama, LM Studio, or similar, you may
        want to download LocalScore itself and run it with an existing .gguf
        model you have.
      </p>

      <Tabs className="">
        <Tab label="Official Models">
          <OfficialTab />
        </Tab>
        <Tab label="Custom Models">
          <ModelTab />
        </Tab>
      </Tabs>

      <p>for further documentation on localscore, check out the readme</p>

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
