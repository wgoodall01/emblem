import React from "react";
import spinnerUrl from "assets/spinner.svg";

const LoadingSpinner = (props) => (
	<div style={{display:"flex", justifyContent:"center"}}>
		<img 
			alt="Loading..." 
			src={spinnerUrl}
			style={{
				width:"40px",
				height:"40px",
				margin:"20px"
			}}
		/>
	</div>
)

export default LoadingSpinner;
