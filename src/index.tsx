import React from "react";
import { createRoot } from "react-dom/client";
import { CodapProvider } from "./components/CodapContext";
import App from "./components/app";

import "./index.css";

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <CodapProvider>
    <App />
  </CodapProvider>

);
