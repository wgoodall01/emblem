import React from "react";
import "./Button.css";
import classnames from "classnames";

/*
 * Component for a clickable button.
 *
 * Props:
 * inverse - true for backgroung of --color-primary.
 * outline - swap border/background colors.
 * onClick - event handler
 * style - button style.
 *
 */
const Button = props => (
  <button
    className={classnames({
      Button: true,
      Button_inverse: props.inverse,
      Button_outline: props.outline
    })}
    onClick={e => props.onClick(e)}
    style={props.style}
  >
    {props.label}
  </button>
);

export default Button;
