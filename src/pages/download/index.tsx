import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, Tab } from "@/components/ui/Tab";
import { OperatingSystem } from "@/lib/types";
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import ScratchTab from "./ScratchTab";
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
      <p>idk some content here???</p>

      <Tabs>
        <Tab label="Official Models">
          <ScratchTab />
        </Tab>
        <Tab label="Custom Models">
          <ModelTab />
        </Tab>
      </Tabs>

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
