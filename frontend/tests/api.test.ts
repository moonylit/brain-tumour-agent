import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  apiClient,
  API_BASE_URL,
  checkBackendHealth,
  predictMRI,
  getHistory,
  getStatistics,
  getEvaluation,
  getEvaluationPlots,
  downloadReport,
  getHeatmapUrl,
  getPlotUrl,
  formatApiError,
  formatTumorClass,
  PredictionResponse,
  HistoryItem,
  StatisticsResponse,
  EvaluationMetrics,
  EvaluationPlots,
  HealthResponse,
} from "../lib/api";

describe("API Client (lib/api.ts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("API_BASE_URL", () => {
    it("is defined and defaults or uses NEXT_PUBLIC_API_URL", () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe("string");
      expect(API_BASE_URL.endsWith("/")).toBe(false);
    });
  });

  describe("checkBackendHealth", () => {
    it("calls GET /health with 5000ms timeout and returns data", async () => {
      const mockHealth: HealthResponse = {
        status: "healthy",
        model_loaded: true,
      };

      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockHealth,
      } as AxiosResponse);

      const result = await checkBackendHealth();

      expect(getSpy).toHaveBeenCalledWith("/health", { timeout: 5000 });
      expect(result).toEqual(mockHealth);
    });
  });

  describe("predictMRI", () => {
    it("posts file via FormData to /predict with multipart headers", async () => {
      const mockResponse: PredictionResponse = {
        prediction: "glioma",
        confidence: 0.985,
        probabilities: { glioma: 0.985, meningioma: 0.01, notumor: 0.003, pituitary: 0.002 },
        processing_time_ms: 120,
        heatmap_filename: "gradcam_test.png",
      };

      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const mockFile = new File(["dummy-content"], "scan.jpg", { type: "image/jpeg" });
      const result = await predictMRI(mockFile);

      expect(postSpy).toHaveBeenCalledTimes(1);
      const [endpoint, formData, config] = postSpy.mock.calls[0];
      expect(endpoint).toBe("/predict");
      expect(formData).toBeInstanceOf(FormData);
      expect((formData as FormData).get("file")).toBe(mockFile);
      expect(config?.headers?.["Content-Type"]).toBe("multipart/form-data");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getHistory", () => {
    const mockHistory: HistoryItem[] = [
      {
        timestamp: "2026-03-28T10:00:00",
        filename: "mri1.jpg",
        prediction: "meningioma",
        confidence: 0.95,
        processing_time_ms: 95,
        heatmap_filename: "heatmap1.png",
      },
    ];

    it("calls /history without params when no options provided", async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockHistory,
      } as AxiosResponse);

      const result = await getHistory();

      expect(getSpy).toHaveBeenCalledWith("/history", { params: {} });
      expect(result).toEqual(mockHistory);
    });

    it("passes limit, prediction, and sort parameters correctly", async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockHistory,
      } as AxiosResponse);

      await getHistory({ limit: 5, prediction: " glioma ", sort: "asc" });

      expect(getSpy).toHaveBeenCalledWith("/history", {
        params: {
          limit: 5,
          prediction: "glioma",
          sort: "asc",
        },
      });
    });

    it("ignores non-positive limit and whitespace-only prediction", async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: [],
      } as AxiosResponse);

      await getHistory({ limit: 0, prediction: "   ", sort: "desc" });

      expect(getSpy).toHaveBeenCalledWith("/history", {
        params: {
          sort: "desc",
        },
      });
    });
  });

  describe("getStatistics", () => {
    it("calls GET /statistics and returns StatisticsResponse", async () => {
      const mockStats: StatisticsResponse = {
        total_predictions: 10,
        average_confidence: 0.92,
        average_processing_time_ms: 110,
        class_distribution: { glioma: 4, meningioma: 3, notumor: 2, pituitary: 1 },
        class_percentages: { glioma: 40, meningioma: 30, notumor: 20, pituitary: 10 },
        most_common_prediction: "glioma",
      };

      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockStats,
      } as AxiosResponse);

      const result = await getStatistics();

      expect(getSpy).toHaveBeenCalledWith("/statistics");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getEvaluation and getEvaluationPlots", () => {
    it("getEvaluation calls GET /evaluation", async () => {
      const mockMetrics: EvaluationMetrics = {
        accuracy: 0.965,
        precision: 0.966,
        recall: 0.965,
        f1_score: 0.965,
      };

      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockMetrics,
      } as AxiosResponse);

      const result = await getEvaluation();

      expect(getSpy).toHaveBeenCalledWith("/evaluation");
      expect(result).toEqual(mockMetrics);
    });

    it("getEvaluationPlots calls GET /evaluation/plots", async () => {
      const mockPlots: EvaluationPlots = {
        confusion_matrix: "/static/confusion_matrix.png",
        roc_curve: "/static/roc_curve.png",
        precision_recall_curve: "/static/pr_curve.png",
      };

      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockPlots,
      } as AxiosResponse);

      const result = await getEvaluationPlots();

      expect(getSpy).toHaveBeenCalledWith("/evaluation/plots");
      expect(result).toEqual(mockPlots);
    });
  });

  describe("downloadReport", () => {
    it("downloads PDF report via blob URL creation and click trigger", async () => {
      const mockPdfData = new ArrayBuffer(8);
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockPdfData,
      } as AxiosResponse);

      const clickMock = vi.fn();
      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const el = origCreateElement(tagName);
        if (tagName === "a") {
          el.click = clickMock;
        }
        return el;
      });

      await downloadReport();

      expect(apiClient.get).toHaveBeenCalledWith("/report", { responseType: "blob" });
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe("URL helper functions", () => {
    describe("getHeatmapUrl", () => {
      it("returns empty string if filename is missing", () => {
        expect(getHeatmapUrl("")).toBe("");
      });

      it("returns filename untouched if already full URL", () => {
        expect(getHeatmapUrl("http://cdn.example.com/map.png")).toBe("http://cdn.example.com/map.png");
        expect(getHeatmapUrl("https://cdn.example.com/map.png")).toBe("https://cdn.example.com/map.png");
      });

      it("prepends base url and /heatmaps/ with encoding", () => {
        expect(getHeatmapUrl("gradcam test.png")).toBe(`${API_BASE_URL}/heatmaps/gradcam%20test.png`);
      });
    });

    describe("getPlotUrl", () => {
      it("returns empty string if plotPath is missing", () => {
        expect(getPlotUrl("")).toBe("");
      });

      it("returns plotPath untouched if already full URL", () => {
        expect(getPlotUrl("http://example.com/plot.png")).toBe("http://example.com/plot.png");
        expect(getPlotUrl("https://example.com/plot.png")).toBe("https://example.com/plot.png");
      });

      it("ensures leading slash and prepends API_BASE_URL", () => {
        expect(getPlotUrl("/static/roc.png")).toBe(`${API_BASE_URL}/static/roc.png`);
        expect(getPlotUrl("static/roc.png")).toBe(`${API_BASE_URL}/static/roc.png`);
      });
    });
  });

  describe("formatApiError", () => {
    it("handles timeout errors", () => {
      const timeoutErr = new AxiosError("timeout of 30000ms exceeded", "ECONNABORTED");
      expect(formatApiError(timeoutErr)).toBe("Request timed out. The server is taking too long to respond.");

      const msgTimeoutErr = new AxiosError("connection timeout");
      expect(formatApiError(msgTimeoutErr)).toBe("Request timed out. The server is taking too long to respond.");
    });

    it("handles network connectivity errors when response is undefined", () => {
      const netErr = new AxiosError("Network Error");
      expect(formatApiError(netErr)).toContain("Cannot connect to Brain Tumour AI backend");
    });

    it("handles string response data", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: "Raw error string",
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe("Raw error string");
    });

    it("handles detail string in response data", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: { detail: "Custom backend error detail" },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe("Custom backend error detail");
    });

    it("handles detail object with message", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: { detail: { message: "Detailed object message" } },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe("Detailed object message");
    });

    it("handles detail object or array without message by stringifying", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: { detail: [{ loc: ["query", "limit"], msg: "greater than 0" }] },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe(JSON.stringify([{ loc: ["query", "limit"], msg: "greater than 0" }]));
    });

    it("handles data.message property", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: { message: "Top level message" },
        status: 500,
        statusText: "Server Error",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe("Top level message");
    });

    it("falls back to status code and text when data has no recognizable fields", () => {
      const err = new AxiosError("Failed");
      err.response = {
        data: {},
        status: 503,
        statusText: "Service Unavailable",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      expect(formatApiError(err)).toBe("Server error (503): Service Unavailable");
    });

    it("handles standard Javascript Error instance", () => {
      const stdErr = new Error("Standard runtime error");
      expect(formatApiError(stdErr)).toBe("Standard runtime error");
    });

    it("handles unknown non-error values", () => {
      expect(formatApiError(42)).toBe("An unexpected error occurred.");
      expect(formatApiError(null)).toBe("An unexpected error occurred.");
    });
  });

  describe("formatTumorClass", () => {
    it("formats 'notumor' and variations to 'No Tumor'", () => {
      expect(formatTumorClass("notumor")).toBe("No Tumor");
      expect(formatTumorClass("NOTUMOR")).toBe("No Tumor");
      expect(formatTumorClass("no_tumor")).toBe("No Tumor");
      expect(formatTumorClass("no tumor")).toBe("No Tumor");
      expect(formatTumorClass("No Tumor")).toBe("No Tumor");
    });

    it("capitalizes single-word tumor classes properly", () => {
      expect(formatTumorClass("glioma")).toBe("Glioma");
      expect(formatTumorClass("meningioma")).toBe("Meningioma");
      expect(formatTumorClass("pituitary")).toBe("Pituitary");
    });

    it("handles empty or falsy inputs gracefully", () => {
      expect(formatTumorClass("")).toBe("");
      expect(formatTumorClass(undefined as unknown as string)).toBe("");
      expect(formatTumorClass(null as unknown as string)).toBe("");
    });
  });
});
