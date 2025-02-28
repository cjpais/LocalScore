export const multiSelectStyles = {
  control: (base: any, { isFocused, menuIsOpen }: any) => ({
    ...base,
    minHeight: "40px",
    boxShadow: "none",
    outline: "none",
    background: menuIsOpen ? "white" : "#F1EDFC",
    border: isFocused ? "2px solid #582acb" : "2px solid #F1EDFC",
    padding: "8px 2px",
    borderRadius: "8px",
    "&:hover": {
      border: "2px solid #582acb",
    },
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#582acb" : "#F1EDFC",
    color: isFocused ? "white" : isSelected ? "#582acb" : "inherit",
    cursor: "pointer",
    padding: "10px 20px 10px 8px",
    // borderTop: "1px solid rgba(88, 42, 203, 0.1)", // #582ACB at 10% opacity
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
    backgroundColor: "#F1EDFC",
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
      background: "#e9e6f8",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#b9a1fc",
      borderRadius: "4px",
      "&:hover": {
        background: "#582acb",
      },
    },
    padding: 0,
    borderRadius: 8,
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#e6dfff",
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
    color: "#582acb",
    padding: "0px 5px",
    borderRadius: "0px 6px 6px 0px",
    margin: 0,
    ":hover": {
      backgroundColor: "#582acb",
      color: "white",
    },
  }),
};
