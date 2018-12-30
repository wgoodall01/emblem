import React from "react";

/*
 * Flexbox container component.
 * Basically copies props to the flexbox css attributes.
 */
const LayoutContainer = props => (
  <div
    style={{
      display: "flex",
      flexDirection: props.flexDirection,
      flexWrap: props.flexWrap,
      justifyContent: props.justifyContent,
      alignItems: props.alignItems,
      alignContent: props.alignContent
    }}
    className={props.className}
  >
    {props.children}
  </div>
);

export default LayoutContainer;
