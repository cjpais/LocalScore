import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import Hyperlink from "@/components/ui/Hyperlink";
import Separator from "@/components/ui/Separator";
import React from "react";
import Image from "next/image";
import TestDescriptionsTable from "./TestDescriptionsTable";

const AboutHeader = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  return (
    <div className={`space-y-2 pt-6 ${className}`}>
      <h2 className="font-medium text-lg">{text}</h2>
      <Separator />
    </div>
  );
};

const AboutPage = () => {
  return (
    <>
      <Meta
        title="About LocalScore"
        description="LocalScore is a benchmark for measuring AI inference performance across different models and GPUs. Learn how we score model response time, prompt processing speed, and token generation to evaluate real-world AI performance on your hardware."
      />
      <PageHeader>About</PageHeader>
      <AboutHeader text="What is LocalScore?" className="-mt-2" />
      <p>
        LocalScore is an open-source benchmarking tool designed to measure how
        fast Large Language Models (LLMs) run on your specific hardware. It is
        also a public database for the benchmark results.
      </p>
      <p>
        {`Whether you're wondering if your computer can smoothly run an 8 billion
        parameter model or trying to decide which GPU to buy for your local AI
        setup, LocalScore provides the data you need to make informed decisions.`}
      </p>
      <AboutHeader text="How It Works" />
      <p>LocalScore measures three key performance metrics:</p>
      <ol className="space-y-1 text-gray-700 list-decimal list-inside">
        <li>
          <strong className="font-semibold text-gray-900 mr-1">
            Prompt Processing Speed:
          </strong>
          <span className="text-sm">
            How quickly your system processes input text (tokens per second)
          </span>
        </li>

        <li>
          <strong className="font-semibold text-gray-900 mr-1">
            Generation Speed:
          </strong>
          <span className="text-sm">
            How fast your system generates new text (tokens per second)
          </span>
        </li>

        <li>
          <strong className="font-semibold text-gray-900 mr-1">
            Time to First Token:
          </strong>
          <span className="text-sm">
            The latency before the first response appears (milliseconds)
          </span>
        </li>
      </ol>
      <p>
        These metrics are combined into a single <b>LocalScore</b> which gives
        you a straightforward way to compare different hardware configurations.
      </p>
      <p>
        A score of 1,000 is excellent, 250 is passable, and below 100 will
        likely be a poor user experience in some regard.
      </p>
      <p>
        Under the hood, LocalScore leverages{" "}
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile">
          Llamafile
        </Hyperlink>{" "}
        to ensure portability across different systems, making benchmarking
        accessible regardless of your setup.
      </p>
      <AboutHeader text="The Tests" />
      <p>
        LocalScore has a straightforward test suite which is meant to emulate
        many common LLM tasks. The details of the tests are found in the table
        below:
      </p>
      <TestDescriptionsTable />
      <AboutHeader text="Getting Started" />
      <ol className="list-decimal list-inside space-y-1">
        <li>
          <Hyperlink href="/download">Download LocalScore</Hyperlink>
        </li>
        <li>Run the benchmark and view your results</li>
        <li>
          Optionally submit your results to our public database to help the
          community
        </li>
      </ol>
      <p>
        When you submit your results, they become part of our growing database
        of hardware performance profiles, helping others understand what they
        can expect from similar setups.
      </p>
      <p>
        We collect the following non personally identifiable system information:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <span className="font-medium">Operating System Info: </span>
          <span>Name, Version, Release</span>
        </li>

        <li>
          <span className="font-medium">CPU Info: </span>
          <span>Name, Architecture</span>
        </li>
        <li>
          <span className="font-medium">RAM Info: </span>
          <span>Capacity</span>
        </li>
        <li>
          <span className="font-medium">GPU Info: </span>
          <span>Name, Manufacturer, Total Memory</span>
        </li>
      </ul>
      <AboutHeader text="Supported Hardware" />
      <p>LocalScore currently supports:</p>{" "}
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <span className="font-medium">CPUs </span>
          <span>(x86 and ARM)</span>
        </li>
        <li className="font-medium">NVIDIA GPUs</li>
        <li className="font-medium">AMD GPUs</li>
        <li>
          <span className="font-medium">Apple Silicon </span>
          <span>(M1/M2/etc)</span>
        </li>
      </ul>
      <p>
        The benchmark currently only supports single-GPU setups, which we
        believe represents the most practical approach for most users running
        LLMs locally. Similar to how gaming has shifted predominately to single
        GPU setups. In the future we may support multi-GPU setups.
      </p>
      <AboutHeader text="Windows Users" />
      <p>
        {`Due to limitations with
        Windows, you can't run Llamafile's which are larger than 4GB directly.
        Instead, you'll need to use LocalScore as a standalone utility and pass
        in your models in GGUF format to the benchmarking application.`}
      </p>
      <AboutHeader text="Community Project" />
      <div className="flex items-center flex-col">
        <p className="text-center">
          <span>LocalScore is a </span>
          <Hyperlink href="https://builders.mozilla.org/">
            Mozilla Builders
          </Hyperlink>
          <span>
            {" "}
            Project. It is a free and accessible resource for the local AI
            community. It builds upon the excellent work of{" "}
          </span>
          <Hyperlink href="https://github.com/ggml-org/llama.cpp">
            llama.cpp
          </Hyperlink>{" "}
          and{" "}
          <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile">
            Llamafile
          </Hyperlink>
          .
        </p>
        <Hyperlink href="https://builders.mozilla.org">
          <Image
            src="/mozilla-logo.png"
            alt="Mozilla Logo"
            width={200}
            height={100}
            className="pt-2"
          />
        </Hyperlink>
      </div>
      <p>
        {`We welcome contributions, suggestions, and feedback from the community.
        Whether you're interested in improving the benchmarking methodology,
        adding support for new hardware/models, or enhancing the user experience, your
        involvement is appreciated.`}
      </p>
      <p>
        Join us in creating a transparent, useful resource that helps everyone
        make the most of running LLMs on local hardware.
      </p>
      <Separator />
      <p>
        <span>You can find the code for the </span>
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile/localscore">
          LocalScore CLI on GitHub
        </Hyperlink>
        <span>
          {" "}
          along with detailed documentation, command-line options, and
          installation instructions. The code for the LocalScore website can be
          found in this{" "}
        </span>
        <Hyperlink href="https://github.com/cjpais/LocalScore">
          GitHub
        </Hyperlink>{" "}
        repo.
      </p>
    </>
  );
};

export default AboutPage;
