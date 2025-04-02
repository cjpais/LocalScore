import React from "react";

const testScenarios = [
  {
    name: "pp1024+tg16",
    promptProcessing: 1024,
    textGeneration: 16,
    description: "Classification, sentiment analysis, keyword extraction.", // Medium prompt, tiny output
  },
  {
    name: "pp4096+tg256",
    promptProcessing: 4096,
    textGeneration: 256,
    description: "Long document Q&A, RAG, short summary of extensive text.", // Very long prompt, short output
  },
  {
    name: "pp2048+tg256",
    promptProcessing: 2048,
    textGeneration: 256,
    description: "Article summarization, contextual paragraph generation.", // Long prompt, short output
  },
  {
    name: "pp2048+tg768",
    promptProcessing: 2048,
    textGeneration: 768,
    description:
      "Drafting detailed replies, multi-paragraph generation, content sections.", // Long prompt, medium output
  },
  {
    name: "pp1024+tg1024",
    promptProcessing: 1024,
    textGeneration: 1024,
    description:
      "Balanced Q&A, content drafting, code generation based on long sample.", // Medium prompt, medium output
  },
  {
    name: "pp1280+tg3072",
    promptProcessing: 1280,
    textGeneration: 3072,
    description:
      "Complex reasoning, chain-of-thought, long-form creative writing, code generation.", // Medium prompt, very long output
  },
  {
    name: "pp384+tg1152",
    promptProcessing: 384,
    textGeneration: 1152,
    description:
      "Prompt expansion, explanation generation, creative writing, code generation.", // Short prompt, long output
  },
  {
    name: "pp64+tg1024",
    promptProcessing: 64,
    textGeneration: 1024,
    description:
      "Short prompt creative generation (poetry/story), Q&A, code generation.", // Very short prompt, long output
  },
  {
    name: "pp16+tg1536",
    promptProcessing: 16,
    textGeneration: 1536,
    description: "Creative text writing/storytelling, Q&A, code generation.", // Tiny prompt, very long output
  },
];

const TestDescriptionsTable = () => {
  return (
    <div className="w-full">
      <table className="w-full text-xs sm:text-sm">
        <thead className="border-y-2 border-[#EEECF5]">
          <tr>
            <th className="p-1.5 sm:p-2 text-left font-semibold w-[15%]">
              PROMPT TOKENS
            </th>
            <th className="p-1.5 sm:p-2 text-left font-semibold w-[15%]">
              TEXT GENERATION
            </th>
            <th className="p-1.5 sm:p-2 text-left font-semibold w-[50%]">
              SAMPLE USE CASES
            </th>
          </tr>
        </thead>
        <tbody>
          {testScenarios.map((test, index) => (
            <tr key={index} className="hover:bg-gray-50 border-b">
              <td className="p-1.5 sm:p-2 w-[15%]">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">{test.promptProcessing}</span>
                  <span className="text-gray-600 text-2xs sm:text-xs sm:ml-1">
                    tokens
                  </span>
                </div>
              </td>
              <td className="p-1.5 sm:p-2 w-[15%]">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">{test.textGeneration}</span>
                  <span className="text-gray-600 text-2xs sm:text-xs sm:ml-1">
                    tokens
                  </span>
                </div>
              </td>
              <td className="p-1.5 sm:p-2 w-[50%]">
                <div className="break-words">{test.description}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestDescriptionsTable;
