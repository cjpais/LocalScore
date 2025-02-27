import PageHeader from "@/components/PageHeader";
import Separator from "@/components/Separator";
import React from "react";

const AboutPage = () => {
  return (
    <>
      <PageHeader>About</PageHeader>
      <h1 className="font-medium text-xl">Frequently Asked Questions</h1>
      {/* <Separator /> */}

      {/* <h2 className="font-medium text-lg">How do I get started?</h2>
      <p>coming soon</p> */}

      <Separator />
      <h2 className="font-medium text-lg">{"What's"} the performance score?</h2>
      <div className="space-y-2">
        <p className="font-medium">
          The performance score is a metric comprised of the following:
        </p>
        <ul className="list-disc list-inside">
          <li>
            Response Time (How long it takes the model to start responding)
          </li>
          <li>Prompt Processing Speed</li>
          <li>Token Generation Speed</li>
        </ul>
        <p className="font-medium">A score of 1000 represents:</p>
        <ul className="list-disc list-inside">
          <li>Response Time: 200ms</li>
          <li>Prompt Processing Speed: 5000 tok/s</li>
          <li>Token Generation Speed: 40 tok/s</li>
        </ul>
        <p>
          This baseline was chosen as it means that your PC should be able to be
          used for a variety of inference tasks. This could be things like chat
          with an LLM. But also is suitable for applications like RAG, embedding
          large amounts of text, or summarization.
        </p>
      </div>
      <Separator />

      <h2 className="font-medium text-lg">
        {"What's"} a good performance score?
      </h2>
      <div className="space-y-2">
        <p>
          A performance score of <b>1000</b> represents an overall excellent
          experience with a particular Large Language Model (LLM). This would
          mean that the LLM will be able to quickly respond to queries and
          process large prompts quickly.
        </p>
        <p>
          A score of <b>500</b> represents a good experience, where the LLM is
          able to respond to queries and process prompts at a reasonable speed.
          However it could mean that the LLM takes a little longer to respond to
          some queries.
        </p>
        <p>
          A score of <b>200</b> represents a mixed experience. Certainly usable,
          but will likely suffer in one or more ways in terms of {"it's "}
          performance.
        </p>
        <p>
          A score below <b>50</b> generally represents a poor experience, where
          you will be waiting a long time for the LLM to respond to queries and
          process prompts.
        </p>
      </div>
    </>
  );
};

export default AboutPage;
