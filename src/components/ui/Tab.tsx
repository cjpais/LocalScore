import React, { useState, ReactNode } from "react";

interface TabProps {
  label: string;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => {
  // This is just a wrapper component, the actual rendering happens in Tabs
  return <>{children}</>;
};

type TabStyle = "tab" | "button";

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  defaultTab?: number;
  style?: TabStyle;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultTab = 0,
  style = "tab",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Styling based on the selected style type
  const getHeaderStyles = () => {
    if (style === "tab") {
      return "flex w-full";
    }
    return "flex w-full gap-2 p-2";
  };

  const getTabItemStyles = (isActive: boolean) => {
    if (style === "tab") {
      return `py-5 w-full text-center text-sm font-medium transition-colors duration-200 rounded-t-2xl ${
        isActive ? "bg-white" : "bg-gray-200"
      }`;
    }

    return `py-2 px-4 text-sm font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? "bg-primary-500 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;
  };

  const getContentStyles = () => {
    if (style === "tab") {
      return "w-full bg-white rounded-b-2xl p-4";
    }
    return "w-full bg-white rounded-lg mt-3 p-4 border";
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Tab/Button Headers */}
      <div className={getHeaderStyles()}>
        {React.Children.map(children, (child, index) => (
          <button
            key={index}
            className={getTabItemStyles(activeTab === index)}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={getContentStyles()}>
        {React.Children.map(children, (child, index) => (
          <div className={activeTab === index ? "block" : "hidden"}>
            {child.props.children}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Tabs, Tab };
