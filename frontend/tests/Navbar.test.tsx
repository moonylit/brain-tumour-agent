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

    expect(screen.getByText("POWERED BY")).toBeInTheDocument();
    expect(screen.getByText("BrainTumourAI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload" })).toHaveAttribute(
      "href",
      "#upload",
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "#history",
    );
  });

  it("displays 'API Online' status pill when backend health check succeeds", async () => {
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      { status: "healthy", model_loaded: true },
    );

    render(<Navbar />);

    expect(await screen.findByText("API Online")).toBeInTheDocument();
    const statusPill = screen.getByTitle("Backend connected and healthy");
    expect(statusPill).toBeInTheDocument();
    expect(statusPill).toHaveClass("text-emerald-400");
  });

  it("displays 'API Offline' status pill when backend health check fails", async () => {
    (api.checkBackendHealth as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    render(<Navbar />);

    expect(await screen.findByText("API Offline")).toBeInTheDocument();
    const statusPill = screen.getByTitle("Backend is currently unreachable");
    expect(statusPill).toBeInTheDocument();
    expect(statusPill).toHaveClass("text-slate-400");
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
