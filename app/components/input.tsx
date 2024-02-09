import React from "react";

const Input = (props: any) => {
  const onChange = (e: any) => {
    props.onChange(e.target.value);
  };

  return (
    <input
      style={props.style}
      type={props.type}
      placeholder={props.placeholder}
      className={`input ${props.className}`}
      onChange={onChange}
      value={props.value}
    >
      {props.children}
    </input>
  );
};

export default Input;
