import React, { ReactNode } from "react";
import Card from "../../ui/Card";
import Separator from "../../ui/Separator";

// TODO it might be useful to have the card component actually have these nicely.
// so it applies to more than just compare cards.

interface CardHeaderProps {
  text: string;
  rightContent?: ReactNode;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

interface CardContainerProps {
  headerText: string;
  headerRightContent?: ReactNode;
  children: ReactNode;
  showSeparator?: boolean;
}

interface SectionTitleProps {
  title: string;
  className?: string;
}

export const CompareCardHeader: React.FC<CardHeaderProps> = ({
  text,
  rightContent,
}) => {
  return (
    <div className="flex gap-2 items-center justify-between">
      <div className="font-bold text-lg">{text}</div>
      {rightContent}
    </div>
  );
};

export const CompareCardSection: React.FC<CardSectionProps> = ({
  children,
  className = "",
}) => {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
};

export const CompareSectionTitle: React.FC<SectionTitleProps> = ({
  title,
  className = "",
}) => {
  return <p className={`font-medium text-lg ${className}`}>{title}</p>;
};

export const CompareChartContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="w-full max-w-vw">{children}</div>;
};

export const CompareCardContainer: React.FC<CardContainerProps> = ({
  headerText,
  headerRightContent,
  children,
  showSeparator = true,
}) => {
  return (
    <Card>
      <CompareCardSection className="pb-4">
        <CompareCardHeader
          text={headerText}
          rightContent={headerRightContent}
        />
        {showSeparator && <Separator thickness={2} />}
        {children}
      </CompareCardSection>
    </Card>
  );
};
