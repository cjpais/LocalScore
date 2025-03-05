import React from "react";
import CaratIcon from "../icons/CaratIcon";

interface SelectProps<T> {
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  defaultValue?: T;
  className?: string;
  roundedStyle?: "left" | "right" | "both" | "none";
  width?: string;
}

const GenericSelect = <T extends string>({
  options,
  onChange,
  defaultValue,
  className = "",
  roundedStyle = "both",
}: SelectProps<T>) => {
  const getRoundedClass = () => {
    switch (roundedStyle) {
      case "left":
        return "rounded-l-md";
      case "right":
        return "rounded-r-md";
      case "both":
        return "rounded-md";
      case "none":
        return "";
      default:
        return "rounded-md";
    }
  };

  return (
    <>
      <select
        className={`px-4 sm:px-5 py-2 sm:py-[10px] text-primary-500 bg-primary-100 border-none appearance-none ${getRoundedClass()} w-full font-medium focus:outline-none text-sm sm:text-base ${className}`}
        onChange={(e) => onChange(e.target.value as T)}
        defaultValue={defaultValue as string}
      >
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaratIcon className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
    </>
  );
};

export default GenericSelect;
