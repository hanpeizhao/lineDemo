import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import liff from "@line/liff";
import { LiffCommonProfilePlugin } from "@line/liff-common-profile-plugin";
import App from "./App";

if (import.meta.env.VITE_MINI_APP !== "false") {
  liff.use(new LiffCommonProfilePlugin());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
