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

// Polyfill DataTransfer and HTMLInputElement.files for drag-and-drop file upload tests
if (typeof window !== "undefined") {
  if (typeof window.DataTransfer === "undefined") {
    class MockDataTransfer {
      items = {
        add: (file: File) => {
          (this.files as any) = [file];
        },
      };
      files: File[] = [];
    }
    (window as any).DataTransfer = MockDataTransfer;
    (global as any).DataTransfer = MockDataTransfer;
  }

  const originalFilesDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "files"
  );
  Object.defineProperty(HTMLInputElement.prototype, "files", {
    get() {
      return (this as any)._mockFiles !== undefined
        ? (this as any)._mockFiles
        : originalFilesDescriptor?.get
        ? originalFilesDescriptor.get.call(this)
        : null;
    },
    set(val) {
      (this as any)._mockFiles = val;
    },
    configurable: true,
  });

  // Polyfill IntersectionObserver for scroll-triggered animation tests
  if (typeof (window as any).IntersectionObserver === "undefined") {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: any) {
        callback([{ isIntersecting: true }]);
      }
    }
    (window as any).IntersectionObserver = MockIntersectionObserver;
    (global as any).IntersectionObserver = MockIntersectionObserver;
  }
}


