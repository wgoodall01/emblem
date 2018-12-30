import React from "react";
import spinnerUrl from "assets/spinner.svg";

/*
 * Loading spinner.
 * Displays an animated loading spinner (if your browser supports animated svg)
 */
const LoadingSpinner = props => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <img
      alt="Loading..."
      src={spinnerUrl}
      style={{
        width: `${props.size || 40}px`,
        height: `${props.size || 40}px`,
        margin: `${props.margin || 20}px`
      }}
    />
  </div>
);

export default LoadingSpinner;
