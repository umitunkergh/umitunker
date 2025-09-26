import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Debug info
console.log("UU AI Loading...");
console.log("Current path:", window.location.pathname);
console.log("Current host:", window.location.host);

const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log("UU AI App rendered successfully!");
} catch (error) {
  console.error("UU AI App failed to render:", error);
  // Fallback content
  document.getElementById('root').innerHTML = `
    <div style="text-align: center; padding: 50px; font-family: Arial;">
      <h1>🚨 UU AI Loading Error</h1>
      <p>Path: ${window.location.pathname}</p>
      <p>Error: ${error.message}</p>
    </div>
  `;
}
