import { useRouter } from "next/router";
import React from "react";

const AccleratorPage = () => {
  const router = useRouter();
  const { name } = router.query;
  console.log(name);

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
