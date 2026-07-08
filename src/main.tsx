import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/styles";
import { App } from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  let hasReloadedForServiceWorkerUpdate = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hasReloadedForServiceWorkerUpdate) {
      return;
    }

    hasReloadedForServiceWorkerUpdate = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").then((registration) => {
      void registration.update();

      registration.waiting?.postMessage({ type: "SKIP_WAITING" });

      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing;

        nextWorker?.addEventListener("statechange", () => {
          if (
            nextWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            nextWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });
  });
}
