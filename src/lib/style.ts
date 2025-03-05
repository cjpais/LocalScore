import { Theme } from "react-select";

export const multiSelectStyles = {
  control: (base: any, { isFocused, menuIsOpen }: any) => ({
    ...base,
    minHeight: "40px",
    boxShadow: "none",
    outline: "none",
    background: menuIsOpen ? "white" : "var(--background-menu)",
    border: isFocused
      ? "2px solid var(--primary-500)"
      : "2px solid var(--background-menu)",
    padding: "8px 2px",
    borderRadius: "8px",
    "&:hover": {
      border: "2px solid var(--primary-500)",
    },
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused
      ? "var(--primary-500)"
      : "var(--background-menu)",
    color: isFocused ? "white" : isSelected ? "var(--primary-500)" : "inherit",
    cursor: "pointer",
    padding: "10px 20px 10px 8px",
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
  }),
  container: (base: any) => ({
    ...base,
    borderRadius: "none",
  }),
  menu: (base: any) => ({
    ...base,
    marginTop: 0,
    marginBottom: "-10px",
    marginLeft: "8px",
    backgroundColor: "var(--background-menu)",
    width: "calc(100% - 16px)",
    border: "none",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0px 22px 48px 0px rgba(185, 161, 252, 0.6)",
    clipPath: "polygon(-100% 0%, 1000% 0%, 200% 1000%, -100% 1000%)",
    // x padding 8px
  }),
  menuList: (base: any) => ({
    ...base,
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#e9e6f8", // TODO vars
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#b9a1fc", // TODO
      borderRadius: "4px",
      "&:hover": {
        background: "var(--primary-500)",
      },
    },
    padding: 0,
    borderRadius: 8,
    "& > div:last-of-type": {
      borderBottom: "none",
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "var(--primary-100)",
    gap: "8px",
    padding: "0px",
    borderRadius: "6px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    fontSize: "inherit",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "var(--primary-500)",
    padding: "0px 5px",
    borderRadius: "0px 6px 6px 0px",
    margin: 0,
    ":hover": {
      backgroundColor: "var(--primary-500)",
      color: "white",
    },
  }),
};

export const selectTheme = (theme: Theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    // Clear indicator (X button)
    neutral60: "#582ACB", // Normal state
    neutral80: "#582ACB50", // Hovered state

    // Dropdown indicator (arrow)
    neutral20: "#582ACB30", // Separator color with 30% opacity
    neutral30: "#582ACB", // Hovered state for the dropdown indicator

    // Main colors
    primary: "#582ACB", // Used for focused elements
    primary25: "#582ACB30", // Option hover state with 30% opacity
    primary50: "#582ACB80", // Selected option - keeping this a bit more visible at 80%
  },
});
