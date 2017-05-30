import React from "react";
import spinnerUrl from "assets/spinner.svg";

const LoadingSpinner = (props) => (
	<div style={{display:"flex", justifyContent:"center"}}>
		<img alt="Loading..." width="50px" height="50px" src={spinnerUrl}/>
	</div>
)

export default LoadingSpinner;
