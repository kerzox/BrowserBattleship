import React, { useState } from "react";

const ToggleButton = (props: {
  style: React.CSSProperties | undefined;
  className: any;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | null
    | undefined;
}) => {
  const [isToggled, setToggle] = useState(false);

  return (
    <button
      style={
        isToggled ? { ...props.style, backgroundColor: "red" } : props.style
      }
      className={`${props.className}`}
      onClick={(e) => {
        setToggle(!isToggled);
        if (props.onClick != undefined) props.onClick(e);
      }}
    >
      {props.children}
    </button>
  );
};

export default ToggleButton;
