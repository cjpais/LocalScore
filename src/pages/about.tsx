import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import Hyperlink from "@/components/ui/Hyperlink";
import Separator from "@/components/ui/Separator";
import React from "react";

const AboutHeader = ({ text }: { text: string }) => {
  return (
    <div className="space-y-2">
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
      <AboutHeader text="What is LocalScore?" />
      <p>
        LocalScore is an open-source benchmarking tool designed to measure how
        fast Large Language Models (LLMs) run on your specific hardware. It is
        also an public database for the benchmark results.
      </p>
      <p>
        {`Whether you're wondering if your computer can smoothly run an 8 billion
        parameter model or trying to decide which GPU to buy for your local AI
        setup, LocalScore provides the data you need to make informed decisions.`}
      </p>
      <AboutHeader text="How It Works" />
      <p>LocalScore measures three key performance metrics:</p>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-center">
          <span className="mr-2">•</span>
          <strong className="font-semibold text-gray-900 mr-1">
            Prompt Processing Speed:
          </strong>
          <span className="text-sm">
            How quickly your system processes input text (tokens per second)
          </span>
        </li>

        <li className="flex items-center">
          <span className="mr-2">•</span>
          <strong className="font-semibold text-gray-900 mr-1">
            Generation Speed:
          </strong>
          <span className="text-sm">
            How fast your system generates new text (tokens per second)
          </span>
        </li>

        <li className="flex items-center">
          <span className="mr-2">•</span>
          <strong className="font-semibold text-gray-900 mr-1">
            Time to First Token:
          </strong>
          <span className="text-sm">
            The latency before the first response appears (milliseconds)
          </span>
        </li>
      </ul>
      <p>
        These metrics are combined into a single <b>LocalScore</b> value using a
        balanced formula that gives you a straightforward way to compare
        different hardware configurations.
      </p>
      <p>
        A score of a 1,000 is excellent, whereas a score of 100 is not so great.
      </p>
      <p>
        Under the hood, LocalScore leverages{" "}
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile">
          llamafile
        </Hyperlink>{" "}
        to ensure portability across different systems, making benchmarking
        accessible regardless of your setup.
      </p>
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
      <AboutHeader text="Supported Hardware" />
      <p>LocalScore currently supports:</p>{" "}
      <ul className="list-disc pl-5 space-y-1">
        <li>CPUs (various architectures)</li>
        <li>NVIDIA GPUs</li>
        <li>AMD GPUs</li>
        <li>Apple Silicon (M1/M2/M3 series)</li>
      </ul>
      <p>
        The benchmark currently only supports single-GPU setups, which we
        believe represents the most practical approach for most users running
        LLMs locally. Similar to how gaming has shifted predominately to single
        GPU setups. In the future we may support multi-GPU setups.
      </p>
      <AboutHeader text="Windows Users" />
      <p>
        {`If you're on Windows, there's a small caveat: due to limitations with
        llamafile distributions, you can't run models larger than 4GB directly.
        Instead, you'll need to use LocalScore as a standalone utility and pass
        in your models in GGUF format to the benchmarking application.`}
      </p>
      <AboutHeader text="Community Project" />
      <p>
        LocalScore was created with support from{" "}
        <Hyperlink href="https://builders.mozilla.org/">
          Mozilla Builders
        </Hyperlink>{" "}
        as a resource for the AI community. It builds upon the excellent work of{" "}
        <Hyperlink href="https://github.com/ggml-org/llama.cpp">
          llama.cpp
        </Hyperlink>{" "}
        and{" "}
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile">
          llamafile
        </Hyperlink>
      </p>
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
        You can find LocalScore on{" "}
        <Hyperlink href="https://github.com/cjpais/llamafile/tree/cjpais/localscore/llama.cpp/localscore">
          GitHub
        </Hyperlink>{" "}
        along with detailed documentation, command-line options, and
        installation instructions. The code for this website can be found in
        this{" "}
        <Hyperlink href="https://github.com/Mozilla-Ocho/LocalScore">
          GitHub
        </Hyperlink>{" "}
        repo.
      </p>
    </>
  );
};

export default AboutPage;
