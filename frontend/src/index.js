import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Comprehensive error suppression for ResizeObserver
// These errors are benign and caused by Radix UI components
const suppressResizeObserverErrors = () => {
  // Suppress console.error for ResizeObserver
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ResizeObserver loop') ||
       args[0].includes('ResizeObserver'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress window error events
  window.addEventListener('error', (e) => {
    if (
      e.message &&
      (e.message.includes('ResizeObserver loop') ||
       e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
       e.message === 'ResizeObserver loop limit exceeded')
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  });

  // Monkey-patch ResizeObserver
  if (typeof ResizeObserver !== 'undefined') {
    const OriginalResizeObserver = ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        super((entries, observer) => {
          requestAnimationFrame(() => {
            callback(entries, observer);
          });
        });
      }
    };
  }
};

suppressResizeObserverErrors();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
