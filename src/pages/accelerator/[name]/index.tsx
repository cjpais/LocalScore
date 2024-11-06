import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

const AccleratorPage = () => {
  const router = useRouter();

  // const { data, error } = useSWR(
  //   [
  //     "/api/getAccelerator",
  //     { accelerator: parsed.name, memory: parsed.memory },
  //   ], // Note the array format for key and data
  //   fetcher
  // );
  // console.log(data, error);

  return <div></div>;
};

export default AccleratorPage;
