import Meta from "@/components/layout/Meta";
import PageHeader from "@/components/layout/PageHeader";
import Hyperlink from "@/components/ui/Hyperlink";
import Separator from "@/components/ui/Separator";
import React from "react";
import Image from "next/image";
import TestDescriptionsTable from "@/components/informational/TestDescriptionsTable";
import { OFFICIAL_MODELS } from "@/lib/config";

const BlogHeader = ({
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

const ModelTable = () => {
  return (
    <div className="w-full">
      <table className="w-full text-xs sm:text-sm">
        <thead className="border-y-2 border-[#EEECF5]">
          <tr>
            <th className="p-1.5 sm:p-2 text-left font-semibold w-[25%]"></th>
            {OFFICIAL_MODELS.map((model, index) => (
              <th key={index} className="p-1.5 sm:p-2 text-right font-semibold">
                {model.humanLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50 border-b">
            <td className="p-1.5 sm:p-2 text-left font-medium"># Params</td>
            {OFFICIAL_MODELS.map((model, index) => (
              <td key={index} className="p-1.5 sm:p-2 text-right">
                {model.params}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-gray-50 border-b">
            <td className="p-1.5 sm:p-2 text-left font-medium">Model Family</td>
            {OFFICIAL_MODELS.map((model, index) => (
              <td key={index} className="p-1.5 sm:p-2 text-right">
                {model.shortName}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-gray-50 border-b">
            <td className="p-1.5 sm:p-2 text-left font-medium">Quantization</td>
            {OFFICIAL_MODELS.map((model, index) => (
              <td key={index} className="p-1.5 sm:p-2 text-right">
                Q4_K_M
              </td>
            ))}
          </tr>
          <tr className="hover:bg-gray-50 border-b">
            <td className="p-1.5 sm:p-2 text-left font-medium">
              Approx VRAM Required
            </td>
            {OFFICIAL_MODELS.map((model, index) => (
              <td key={index} className="p-1.5 sm:p-2 text-right">
                {model.vram}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Index = () => {
  return (
    <>
      <Meta
        title="Introducing LocalScore: A Local LLM Benchmark"
        description="LocalScore is an open-source tool that benchmarks how fast Large Language Models (LLMs) run on your specific hardware and serves as a repository for these results."
      />
      <PageHeader>Blog</PageHeader>
      <div className="flex flex-col justify-between">
        <h1 className="text-2xl font-bold">
          Introducing LocalScore: A Local LLM Benchmark
        </h1>
        <div className="text-sm text-gray-600">
          <span>Thursday April 3rd, 2025</span>
          <span className="mx-2">•</span>
          <span className="font-medium">CJ Pais</span>
        </div>
      </div>
      <Separator />
      <p>
        Today, {"we're"} excited to announce <strong>LocalScore</strong> – an
        open-source tool that both benchmarks how fast Large Language Models
        (LLMs) run on your specific hardware and serves as a repository for
        these results. We created LocalScore to provide a simple, portable way
        to evaluate computer performance across various LLMs while making it
        easy to share and browse hardware performance data.
      </p>
      <p>
        We believe strongly in the power of local AI systems, especially as
        smaller models become more powerful. In addition we expect computer
        hardware to become more powerful and cheaper to run these models. We
        hope this will create an opportunity for accessible and private AI
        systems, and that LocalScore will help you navigate this.
      </p>
      <div className="font-medium">
        <span>tldr: </span>
        <Hyperlink href="https://localscore.ai/download">
          Download LocalScore
        </Hyperlink>{" "}
        and{" "}
        <Hyperlink href="https://localscore.ai">explore the results</Hyperlink>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="aspect-video w-full max-w-[560px]">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/De6pA1bQsHU?si=eHDum3gmFtaXc_Ej"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full max-w-2xl aspect-video"
          ></iframe>
        </div>
      </div>
      <BlogHeader text="Why We Built LocalScore" />
      <p>
        LocalScore grew out of a distributed computing network some friends and
        I were building together. Our little {`"mac mini network"`} became{" "}
        <Hyperlink href="https://andromeda.computer">
          andromeda.computer
        </Hyperlink>{" "}
        and we quickly surfaced the desire to run private, always-on, local AI
        services. We started out with{" "}
        <Hyperlink href="https://github.com/rhasspy/piper">Piper STT</Hyperlink>
        , and soon after added small vision models (s/o{" "}
        <Hyperlink href="https://moondream.ai/">moondream</Hyperlink>), Whisper,
        and LLMs. As we experimented, questions emerged. What compute is
        appropriate for each task? How do we run the setup cost effectively? How
        can it be portable across heterogeneous hardware?
      </p>
      <p>
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile">
          Llamafile
        </Hyperlink>{" "}
        seemed like an obvious solution for the heterogeneous hardware
        acceleration problem. I helped to get{" "}
        <Hyperlink href="https://github.com/Mozilla-Ocho/llamafile/tree/main/whisper.cpp">
          Whisperfile
        </Hyperlink>{" "}
        off the ground so we could have acceleration on all of our hardware. In
        tandem I started writing a benchmarking tool to answer the other
        questions. At some point Mozilla reached out, curious about why I
        contributed Whisperfile, and was interested in sponsoring the community
        driven benchmarking project. Thus LocalScore was born, built on top of
        Llamafile.
      </p>
      <BlogHeader text="What is a LocalScore?" />
      <p>
        A LocalScore is a measure of three key performance metrics that matter
        for local LLM performance:
      </p>
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
      <BlogHeader text="A Community-Driven Project" />
      <p>
        <strong>LocalScore is 100% open source</strong> (Apache 2.0) and{" "}
        {`we're`}
        excited to build it with the community. We welcome contributions of all
        kinds, from code improvements to documentation updates to feature
        suggestions. For more information on how to contribute and what we are
        looking forward to, scroll down and check the {`"How to Contribute"`}
        section.
      </p>
      <BlogHeader text="LocalScore CLI" />
      <p>
        The LocalScore CLI is built on top of Llamafile and is the first tool
        you can use to submit results to the LocalScore website. We hope it is
        the first of many. This makes running the benchmark as easy as
        downloading a single file and executing it on your computer. Neat.
      </p>
      <div className="my-2">
        <Image
          src="/cli-screenshot.jpeg"
          alt="Screenshot of the LocalScore CLI running in a terminal"
          width={800}
          height={450}
          className="rounded-lg border border-gray-200"
        />
      </div>
      <p>
        The CLI can also be downloaded as {"it's"} own executable and be used to
        run models which are not directly bundled with it. That means you can
        benchmark any .gguf model you have laying around. In addition, Llamafile
        includes the LocalScore benchmark and you can run it via{" "}
        <code>./llamafiile --localscore</code>.
      </p>
      <BlogHeader text="The Tests" />
      <p>
        The tests were designed to provide a realistic picture of how models
        will perform in everyday use. Instead of testing raw prompt processing
        and generation speeds, we wanted to emulate the kinds of tasks that
        users will actually be doing with these models. Below are a list of the
        tests we run and some of the use cases they are meant to emulate.
      </p>
      <TestDescriptionsTable />
      <BlogHeader text="LocalScore Website" />
      <p>
        The LocalScore website is a public repository for LocalScore results. It
        is fairly simple for the time being, and we welcome community feedback
        and contributions to make it the best possible resource for the local AI
        community.
      </p>
      <p>
        One of the major tensions in designing a website to serve the community
        is that there is an incredibly diverse set of models and computer
        hardware that people run. With this in mind we chose to try and simplify
        the number of combinations, while still hopefully providing a useful
        resource.
      </p>
      <p>
        One of our primary goals with LocalScore was to provide people with a
        straightforward way to assess hardware performance across various model
        sizes. To accomplish this, we established a set of{" "}
        {`"official benchmark
        models"`}{" "}
        that serve as reference points for different size categories. Currently
        this looks like the following:
      </p>
      <ModelTable />
      <p>
        These standardized benchmarks give you a reliable estimate of how your
        system will handle models within each size category, making it easier to
        determine which LLMs your hardware can effectively run. We are certainly
        interested in having community feedback on what the official benchmark
        models should be, and we are open to adding more models and sizes in the
        future.
      </p>
      <p>
        Another goal was to allow for people to submit results for any model,
        not just the official benchmarks. That way people can keep up with the
        latest trends for models, and still get a sense of how their hardware
        stacks up against others.
      </p>
      <p>
        The two primary ways to view data for GPUs and models are clicking or
        searching the names of them on the website. When clicking on a model,
        you will be able to see a chart for how different accelerators perform
        on that model as well as a dedicated leaderboard for that model. When
        clicking on an accelerator, you will see a chart for how different
        models perform on that accelerator.
      </p>
      <BlogHeader text="Getting Started" />
      <p>Using LocalScore is simple:</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>
          Download the tool from{" "}
          <Hyperlink href="https://localscore.ai/download">
            localscore.ai/download
          </Hyperlink>
        </li>
        <li>Run the benchmark on your hardware</li>
        <li>Optionally submit your results to our public database</li>
      </ol>
      <BlogHeader text="How to Contribute" />
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>GitHub:</strong> The{" "}
          <Hyperlink href="https://github.com/cjpais/LocalScore">
            LocalScore website repository
          </Hyperlink>{" "}
          is where most development happens. Issues, discussions, and pull
          requests are all welcome.
        </li>
        <li>
          <strong>Bug Reports:</strong> Found an issue? Please report it through
          GitHub Issues.
        </li>
        <li>
          <strong>Feature Requests:</strong> Have an idea for how to improve
          LocalScore? Open a discussion in the GitHub repo.
        </li>
        <li>
          <strong>Code Contributions:</strong> Pull requests are very welcome,
          particularly around website features, visualizations, or UI
          improvements.
        </li>
      </ul>
      <BlogHeader text="Scope and Focus" />
      <p>
        As with any benchmark, we need to balance comprehensiveness with
        practicality. While {`we'd`} love to cover every possible LLM
        configuration, we need to focus on common use cases that affect most
        users. This means:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          We {`can't`} cover every possible variation (speculative decoding,
          context lengths, etc.)
        </li>
        <li>
          We focus on single GPU setups for now as we expect this to by typical
          for most local users. We love enthusiasts who push the boundary of
          what is possible locally, but we are generally aimed at the more
          average case.
        </li>
      </ul>
      <p>
        {`That said, if there's strong community interest and support for specific
        features, we're open to thoughtfully expanding our scope.`}
      </p>
      <BlogHeader text="Looking to the Future" />
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Upstreaming to llama.cpp:</strong> {`We'd`} love to see these
          benchmarking capabilities integrated directly into llama.cpp, making
          them available to an even wider audience. The current codebase is
          built on top of Llamafile, a lot of the current code could be
          upstreamed with some effort since Llamafile is built on top of
          llama.cpp. The CLI client is a fork of the <code>llama-bench</code>{" "}
          program built into llama.cpp which was modifed to be more specific and
          user friendly.
        </li>
        <li>
          <strong>Third-Party Clients:</strong> We welcome developers who want
          to create custom clients that interface with LocalScore. If {`you're`}
          building a client and would like to submit results to our database,
          please reach out to{" "}
          <Hyperlink href="mailto:contact@localscore.ai">
            contact@localscore.ai
          </Hyperlink>
          . We are particularly interested in GUI clients as well, and maybe
          upstreaming to llama.cpp will enable this.
        </li>
        <li>
          <strong>Public APIs:</strong> {`We're`} considering opening up APIs
          for the website to allow programmatic access to benchmark data. If you
          have specific use cases in mind, please let us know.
        </li>
        <li>
          <strong>Expanded Metrics:</strong> In the future, {`we'd`} like to add
          an efficiency score which would take into account the power
          consumption of the accelerator. A lot of this code is in place, but
          needs work to be portable across more systems to be shipped.
        </li>
        <li>
          <strong>Beyond Text:</strong> While our current focus is on text
          models, {`we're`} interested in eventually benchmarking:
          <ul className="list-disc pl-5 mt-1">
            <li>Vision models</li>
            <li>Audio models (speech-to-text and text-to-speech)</li>
            <li>Diffusion models</li>
          </ul>
        </li>
      </ul>
      These expanded benchmarks are lower priority currently, but strong
      community interest and contributions could accelerate their development.
      <BlogHeader text="Join Us" />
      <p>
        LocalScore is a{" "}
        <Hyperlink href="https://builders.mozilla.org/">
          Mozilla Builders
        </Hyperlink>{" "}
        project created to serve the local AI community. We believe in the power
        of running AI locally, and we want to make that experience as smooth as
        possible for everyone.
      </p>
      <p>
        Your feedback and contributions are not just {"appreciated—they're"}
        essential to making LocalScore a truly valuable community resource.
        Visit <Hyperlink href="https://localscore.ai">
          localscore.ai
        </Hyperlink>{" "}
        to try the benchmark, explore results, and join our community.
      </p>
    </>
  );
};

export default Index;
