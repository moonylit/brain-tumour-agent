import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    checkBackendHealth: vi.fn(),
  };
});

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SerpApi branding, brand logo, and navigation links", () => {
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      { status: "healthy", model_loaded: true },
    );

    render(<Navbar />);

    expect(screen.getByText(/Powered By/i)).toBeInTheDocument();
    expect(screen.getByText("SerpApi")).toBeInTheDocument();
    expect(screen.getByText("BrainTumourAI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload" })).toHaveAttribute(
      "href",
      "#upload",
    );
    expect(screen.getByRole("link", { name: "Statistics" })).toHaveAttribute(
      "href",
      "#statistics",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "#history",
    );
    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "#features",
    );
  });

  it("displays 'API Online' status pill when backend health check succeeds", async () => {
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      { status: "healthy", model_loaded: true },
    );

    render(<Navbar />);

    expect(await screen.findByText("API Online")).toBeInTheDocument();
  });

  it("displays 'API Offline' status pill when backend health check fails", async () => {
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    render(<Navbar />);

    expect(await screen.findByText("API Offline")).toBeInTheDocument();
  });

  it("cleans up interval timer when unmounted", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      { status: "healthy", model_loaded: true },
    );

    const { unmount } = render(<Navbar />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
