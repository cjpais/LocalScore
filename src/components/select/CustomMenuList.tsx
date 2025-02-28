import { MenuListProps, components } from "react-select";
import React from "react";

const MenuListWithHeader: React.FC<
  MenuListProps<any, boolean> & { headerText: string }
> = (props) => {
  return (
    <components.MenuList {...props}>
      <div
        className="px-7 text-[#BAB4D9] text-sm py-[10px]"
        style={{
          borderBottom: "1px solid rgba(88, 42, 203, 0.1)",
        }}
      >
        {props.headerText}
      </div>
      {props.children}
    </components.MenuList>
  );
};

export default MenuListWithHeader;
