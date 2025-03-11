import React, { useState, ReactNode } from "react";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Convert children to string for copying
  const codeAsString =
    typeof children === "string"
      ? children
      : React.isValidElement(children) && children.type === "code"
      ? React.Children.toArray(children.props.children).join("")
      : React.Children.toArray(children).join("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeAsString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={`relative bg-primary-100 rounded-md p-4 font-mono text-sm ${className}`}
    >
      <pre className="whitespace-pre-wrap break-all">{children}</pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 rounded hover:bg-primary-200 transition-colors text-primary-500"
        aria-label="Copy code"
        title={isCopied ? "Copied!" : "Copy to clipboard"}
      >
        {isCopied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CodeBlock;
