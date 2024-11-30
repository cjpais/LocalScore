import PageHeader from "@/components/PageHeader";
import React from "react";

const AboutPage = () => {
  return (
    <>
      <PageHeader text="About" />
      <h1>Frequently Asked Questions</h1>
      <p>Here are some frequently asked questions about LocalScore</p>

      <h2>What is LocalScore?</h2>
      <div>something here</div>

      <h2>How do I get started?</h2>

      <h2>What is a good performance score?</h2>
      <div>
        <p>
          A performance score of 1000 represents an overall excellent experience
          with a particular Large Language Model (LLM). This would mean that the
          LLM will be able to quickly respond to queries and process large
          prompts quickly.
        </p>
        <p>
          A score of 500 represents a good experience, where the LLM is able to
          respond to queries and process prompts at a reasonable speed. However
          it could mean that the LLM takes a little longer to respond to some
          queries.
        </p>
        <p>
          A score of 200 represents a mixed experience. Certainly usable, but
          will likely suffer in one or more ways in terms of it`&#39;s
          performance.
        </p>
        <p>
          A score below 100 generally represents a poor experience, where you
          will be waiting a long time for the LLM to respond to queries and
          process prompts.
        </p>
      </div>

      <h2>What does the performance score represent?</h2>
      <div>
        <p>The performance score is a combination metric of the following:</p>
        <ul>
          <li>
            Response Time (How long it takes the model to respond to start
            responding)
          </li>
          <li>Prompt Processing Speed</li>
          <li>Token Generation Speed</li>
        </ul>
        <p>The baseline of this metric was set so a score of 1000 represents</p>
        <ul>
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
    </>
  );
};

export default AboutPage;
