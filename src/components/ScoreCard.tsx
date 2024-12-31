import React from "react";

const ScoreCard = ({
  title,
  value,
  unit = "",
  bgColor,
  textColor,
  className = "",
}: {
  title: string;
  value: string;
  unit?: string;
  bgColor: string;
  textColor: string;
  className?: string;
}) => (
  <div
    className={`flex justify-between rounded-md ${bgColor} p-5 items-center ${className}`}
  >
    <p className={`${textColor} font-medium text-lg`}>{title}</p>
    <div className="flex items-center gap-1">
      <p className="font-medium text-lg">{value}</p>
      {unit && <p>{unit}</p>}
    </div>
  </div>
);

export default ScoreCard;
