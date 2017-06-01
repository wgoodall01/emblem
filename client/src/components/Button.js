import React from "react";
import "./Button.css";
import classnames from "classnames";

const Button = (props) => (
	<button 
		className={classnames({
			"Button":true, 
			"Button_inverse":props.inverse, 
			"Button_outline":props.outline,
		})}
		onClick={e => props.onClick(e)}
		style={props.style}
	>
		{props.label}
	</button>
		
)

export default Button
