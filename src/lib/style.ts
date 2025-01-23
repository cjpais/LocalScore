export const multiSelectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: "40px",
    border: "2px solid #e6dfff",
    padding: "8px 4px",
    borderRadius: "8px",
    // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#e6dfff" : "transparent",
    color: isSelected ? "#582acb" : "inherit",
    cursor: "pointer",
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#e6dfff",
    gap: "8px",
    padding: "4px 8px",
    borderRadius: "8px",
  }),
};
