import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
const root = document.getElementById("root");
const app = (
  <App initialLanguage={document.documentElement.dataset.locale || "en"} />
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
