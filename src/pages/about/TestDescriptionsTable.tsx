import React from "react";

const testScenarios = [
  {
    name: "pp1024+tg16",
    description: "Classification, sentiment analysis, keyword extraction.", // Medium prompt, tiny output
  },
  {
    name: "pp4096+tg256",
    description: "Long document Q&A, RAG, short summary of extensive text.", // Very long prompt, short output
  },
  {
    name: "pp2048+tg256",
    description: "Article summarization, contextual paragraph generation.", // Long prompt, short output
  },
  {
    name: "pp2048+tg768",
    description:
      "Drafting detailed replies, multi-paragraph generation, content sections.", // Long prompt, medium output
  },
  {
    name: "pp1024+tg1024",
    description:
      "Balanced Q&A, content drafting, code generation based on long sample.", // Medium prompt, medium output
  },
  {
    name: "pp1280+tg3072",
    description:
      "Complex reasoning, chain-of-thought, long-form creative writing, code generation.", // Medium prompt, very long output
  },
  {
    name: "pp384+tg1152",
    description:
      "Prompt expansion, explanation generation, creative writing, code generation.", // Short prompt, long output
  },
  {
    name: "pp64+tg1024",
    description:
      "Short prompt creative generation (poetry/story), Q&A, code generation.", // Very short prompt, long output
  },
  {
    name: "pp16+tg1536",
    description: "Creative text writing/storyelling, Q&A, code generation.", // Tiny prompt, very long output
  },
];

const TestDescriptionsTable = () => {
  return (
    <table className="min-w-full text-sm">
      <thead className="border-y-2 border-[#EEECF5]">
        <tr>
          <th className="p-2 pr-4 text-left font-semibold">TEST NAME</th>
          <th className="p-2 text-left font-semibold">SAMPLE USE CASES</th>
        </tr>
      </thead>
      <tbody>
        {testScenarios.map((test, index) => (
          <tr key={index} className="hover:bg-gray-50 border-b">
            <td className="p-2 pr-4 font-mono font-medium text-neutral-800">
              {test.name}
            </td>{" "}
            <td className="p-2">{test.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TestDescriptionsTable;
