import React, { useState, ReactNode, useEffect } from "react";

interface TabProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

export const TabContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`px-8 py-5 space-y-5 ${className}`}>{children}</div>;
};

type TabStyle = "tab" | "invisible";

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  defaultTab?: number;
  style?: TabStyle;
  className?: string;
  labelClassName?: string;
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultTab = 0,
  style = "tab",
  className = "",
  labelClassName = "",
  activeTabIndex,
  onTabChange,
}) => {
  // Internal state for when component is uncontrolled
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  // Determine whether we're in controlled or uncontrolled mode
  const isControlled = activeTabIndex !== undefined;

  // The active tab is either the external one (if provided) or our internal state
  const activeTab = isControlled ? activeTabIndex : internalActiveTab;

  // Update internal state when external activeTabIndex changes
  useEffect(() => {
    if (isControlled) {
      setInternalActiveTab(activeTabIndex);
    }
  }, [isControlled, activeTabIndex]);

  // Handle tab changes, notifying parent when in controlled mode
  const handleTabChange = (index: number) => {
    if (!isControlled) {
      setInternalActiveTab(index);
    }

    // Always notify parent through callback if available
    if (onTabChange) {
      onTabChange(index);
    }
  };

  // Styling functions
  const getHeaderStyles = () => {
    if (style === "invisible") {
      return "hidden"; // Hide the tab headers completely
    }
    return "flex w-full"; // For tab style
  };

  const getTabItemStyles = (isActive: boolean, index: number) => {
    if (style === "invisible") {
      return "hidden"; // Not used but included for completeness
    }
    // For tab style
    return `py-5 w-full text-center font-medium transition-colors duration-200 rounded-t-2xl ${
      isActive ? "bg-white" : `bg-primary-50`
    } ${labelClassName}`;
  };

  const getContentStyles = () => {
    if (style === "invisible") {
      return "w-full"; // No special styling for invisible mode
    }
    return "w-full bg-white rounded-b-2xl"; // For tab style
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Tab Headers - hidden when style is "invisible" */}
      {style !== "invisible" && (
        <div className={getHeaderStyles()}>
          {React.Children.map(children, (child, index) => (
            <button
              key={index}
              className={getTabItemStyles(activeTab === index, index)}
              onClick={() => handleTabChange(index)}
            >
              {child.props.label}
            </button>
          ))}
        </div>
      )}

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
