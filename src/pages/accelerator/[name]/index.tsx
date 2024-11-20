import { useRouter } from "next/router";
import React from "react";

const AccleratorPage = () => {
  const router = useRouter();
  const { name } = router.query;
  console.log(name);

  return <div></div>;
};

export default AccleratorPage;
