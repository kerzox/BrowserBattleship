import React from "react";

const Button = (props: any) => {
  return (
    <button
      onKeyDown={props.onKeyDown}
      style={props.style}
      className={`${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
