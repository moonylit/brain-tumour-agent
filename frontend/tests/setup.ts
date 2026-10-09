import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Polyfill window.URL.createObjectURL / revokeObjectURL for file upload tests
if (typeof window !== "undefined") {
  window.URL.createObjectURL = vi.fn(() => "blob:mock-preview-url");
  window.URL.revokeObjectURL = vi.fn();
}
