import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ensureApi } from "./data/licenseData";

// Deteksi server API (MySQL) sebelum aplikasi dirender
ensureApi().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
});
