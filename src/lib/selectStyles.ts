import { Theme } from "react-select";

const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "var(--background-scrollbar)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "var(--scrollbar-thumb)",
    borderRadius: "4px",
    "&:hover": {
      background: "var(--primary-500)",
    },
  },
};

const commonStyles = {
  menu: (base: any) => ({
    ...base,
    marginTop: 0,
    backgroundColor: "var(--background-menu)",
    border: "none",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0px 14px 84px -14px rgba(185, 161, 252, 0.6)",
    ...scrollbarStyles,
  }),

  menuList: (base: any) => ({
    ...base,
    ...scrollbarStyles,
    padding: 0,
    borderRadius: "0 0 8px 8px",
  }),

  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused
      ? "var(--primary-500)"
      : "var(--background-menu)",
    color: isFocused ? "white" : isSelected ? "var(--primary-500)" : "inherit",
    cursor: "pointer",
    padding: "10px 20px",
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)",
  }),

  control: (base: any, { menuIsOpen }: any) => ({
    ...base,
    background: menuIsOpen
      ? "var(--background-menu)"
      : "var(--background-menu)",
    "&:hover": {
      background: menuIsOpen
        ? "var(--background-menu)"
        : "var(--background-menu-hover)",
    },
    boxShadow: "none",
    borderRadius: menuIsOpen ? "8px 8px 0 0" : "8px",
  }),
};

// Specific styles for search component
export const searchStyles = {
  dropdownIndicator: () => ({
    display: "none",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menu: (base: any) => ({
    ...commonStyles.menu(base),
    marginBottom: 0,
    padding: "0px 0px",
    clipPath:
      "polygon(-100% -50%, 0 -50%, 0 0, 100% 0, 100% -50%, 200% -50%, 200% 200%, -100% 200%)",
  }),

  menuList: (base: any) => ({
    ...commonStyles.menuList(base),
    borderTop: "1px solid rgba(88, 42, 203, 0.1)",
    "& > div:last-child > div:last-child > div:last-child": {
      borderBottom: "none",
    },
  }),

  container: (base: any, { isFocused }: any) => ({
    ...base,
    borderRadius: isFocused ? "8px 8px 0 0" : "8px",
    backgroundColor: "var(--background-menu)",
  }),

  control: (base: any, props: any) => ({
    ...commonStyles.control(base, props),
    border: "none",
    padding: "10px 20px",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: props.menuIsOpen ? "8px 8px 0 0" : "8px",
      boxShadow: props.menuIsOpen
        ? "0 14px 84px 0 rgba(185, 161, 252, 0.6)"
        : "none",
      zIndex: -1,
    },
  }),

  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),

  group: (base: any) => ({
    ...base,
    padding: 0,
  }),

  groupHeading: (base: any) => ({
    ...base,
    color: "var(--grey-400)",
    fontWeight: 500,
    padding: "10px 20px",
    borderBottom: "1px solid rgba(88, 42, 203, 0.1)",
    textTransform: "none",
  }),

  option: commonStyles.option,
};

// Specific styles for multi-select component
export const multiSelectStyles = {
  control: (base: any, { isFocused, menuIsOpen }: any) => ({
    ...commonStyles.control(base, { menuIsOpen }),
    minHeight: "40px",
    border: isFocused
      ? "2px solid var(--primary-500)"
      : "2px solid var(--background-menu)",
    padding: "8px 2px",
    borderRadius: "8px", // Ensures all corners are rounded when menu is closed
  }),

  option: (base: any, props: any) => ({
    ...commonStyles.option(base, props),
    padding: "10px 20px 10px 8px",
  }),

  container: (base: any) => ({
    ...base,
    borderRadius: "none",
  }),

  menu: (base: any) => ({
    ...commonStyles.menu(base),
    marginBottom: "-10px",
    marginLeft: "8px",
    width: "calc(100% - 16px)",
    boxShadow: "0px 22px 48px 0px rgba(185, 161, 252, 0.6)",
    clipPath: "polygon(-100% 0%, 1000% 0%, 200% 1000%, -100% 1000%)",
  }),

  menuList: (base: any) => ({
    ...commonStyles.menuList(base),
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
