import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export type PredictionClass = "glioma" | "meningioma" | "pituitary" | "notumor";

export interface ClinicalArticle {
  title: string;
  snippet: string;
  url?: string;
  source?: string;
}

export interface ClinicalFacility {
  name: string;
  rating?: number | null;
  address?: string;
  phone?: string;
  link?: string;
}

export interface AgentResearch {
  status: string;
  tumor_class: string;
  confidence: number;
  patient_city: string;
  region?: string;
  escalation_required: boolean;
  clinical_summary: string;
  articles: ClinicalArticle[];
  facilities: ClinicalFacility[];
  queries_executed: string[];
  source_mode?: string;
  timestamp: string;
}

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  processing_time_ms: number;
  heatmap_filename: string;
  raw_heatmap_filename?: string;
  region?: string;
  accession_id?: string;
  agent_research?: AgentResearch;
}

export interface HistoryItem {
  timestamp: string;
  filename: string;
  prediction: string;
  confidence: number;
  processing_time_ms: number;
  heatmap_filename: string;
  raw_heatmap_filename?: string;
  region?: string;
  accession_id?: string;
  agent_research?: AgentResearch;
}

export interface HistoryQueryParams {
  limit?: number;
  prediction?: string;
  sort?: "asc" | "desc";
}

export interface StatisticsResponse {
  total_predictions: number;
  average_confidence: number;
  average_processing_time_ms: number;
  class_distribution: Record<string, number>;
  class_percentages: Record<string, number>;
  most_common_prediction: string | null;
}

export interface RocCurveData {
  fpr: number[];
  tpr: number[];
  auc: number;
}

export interface PrecisionRecallCurveData {
  precision: number[];
  recall: number[];
  average_precision: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  class_labels?: string[];
  confusion_matrix?: number[][];
  roc_curve?: Record<string, RocCurveData>;
  precision_recall_curve?: Record<string, PrecisionRecallCurveData>;
  plots?: EvaluationPlots;
}

export interface EvaluationPlots {
  confusion_matrix: string;
  roc_curve: string;
  precision_recall_curve: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  clinical_agent_ready?: boolean;
}

export interface AgentResearchRequest {
  tumor_class: string;
  confidence?: number;
  region: string;
}

/**
 * Upload an MRI scan and request classification and autonomous clinical agent research
 */
export async function predictMRI(
  file: File,
  region: string = "Jaipur",
): Promise<PredictionResponse> {
  const targetRegion = region && region.trim() ? region.trim() : "Jaipur";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("region", targetRegion);
  formData.append("patient_city", targetRegion);

  const config: {
    headers: Record<string, string>;
    params?: Record<string, string>;
  } = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      region: targetRegion,
      patient_city: targetRegion,
    },
  };

  const response = await apiClient.post<PredictionResponse>(
    "/predict",
    formData,
    config,
  );

  return response.data;
}

export const predictTumor = predictMRI;

/**
 * On-demand autonomous clinical agent research without MRI re-upload
 */
export async function fetchAgentResearch(
  request: AgentResearchRequest
): Promise<AgentResearch> {
  const response = await apiClient.post<AgentResearch>("/agent-research", request);
  return response.data;
}

/**
 * Fetch prediction history with optional filtering, sorting, and limit
 */
export async function getHistory(
  params?: HistoryQueryParams,
): Promise<HistoryItem[]> {
  const queryParams: Record<string, string | number> = {};

  if (params?.limit && params.limit > 0) {
    queryParams.limit = params.limit;
  }
  if (params?.prediction && params.prediction.trim() !== "") {
    queryParams.prediction = params.prediction.trim();
  }
  if (params?.sort) {
    queryParams.sort = params.sort;
  }

  const response = await apiClient.get<HistoryItem[]>("/history", {
    params: queryParams,
  });

  return response.data;
}

/**
 * Fetch aggregated prediction statistics
 */
export async function getStatistics(): Promise<StatisticsResponse> {
  const response = await apiClient.get<StatisticsResponse>("/statistics");
  return response.data;
}

/**
 * Fetch model evaluation metrics
 */
export async function getEvaluation(): Promise<EvaluationMetrics> {
  const response = await apiClient.get<EvaluationMetrics>("/evaluation");
  return response.data;
}

/**
 * Fetch model evaluation plot relative paths
 */
export async function getEvaluationPlots(): Promise<EvaluationPlots> {
  const response = await apiClient.get<EvaluationPlots>("/evaluation/plots");
  return response.data;
}

/**
 * Download the latest prediction as a PDF report
 */
export async function downloadReport(region?: string): Promise<void> {
  const response = await apiClient.get("/report", {
    params: region ? { region } : undefined,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "brain_tumour_report.pdf");
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Construct the full URL for a Grad-CAM heatmap image
 */
export function getHeatmapUrl(filename: string): string {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `${API_BASE_URL}/heatmaps/${encodeURIComponent(filename)}`;
}

/**
 * Construct the full URL for a raw MRI scan image
 */
export function getRawScanUrl(filename: string): string {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `${API_BASE_URL}/heatmaps/${encodeURIComponent(filename)}`;
}

/**
 * Construct the full URL for an evaluation plot image
 */
export function getPlotUrl(plotPath: string): string {
  if (!plotPath) return "";
  if (plotPath.startsWith("http://") || plotPath.startsWith("https://")) {
    return plotPath;
  }
  const cleanPath = plotPath.startsWith("/") ? plotPath : `/${plotPath}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/health", {
    timeout: 5000,
  });
  return response.data;
}

/**
 * Helper to parse backend error details into user-friendly message
 */
export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Request timed out. The server is taking too long to respond.";
    }
    if (!error.response) {
      return `Cannot connect to Brain Tumour AI backend at ${API_BASE_URL}. Please ensure the server is running on port 8000.`;
    }

    const data = error.response.data;
    if (typeof data === "string") {
      return data;
    }
    if (data?.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (typeof data.detail === "object" && data.detail.message) {
        return data.detail.message;
      }
      return JSON.stringify(data.detail);
    }
    if (data?.message) {
      return data.message;
    }
    return `Server error (${error.response.status}): ${error.response.statusText}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

/**
 * Cleanly format tumour class name for display (e.g. "notumor" -> "No Tumor")
 */
export function formatTumorClass(className: string): string {
  if (!className) return "";
  const lower = className.trim().toLowerCase();
  if (lower === "notumor" || lower === "no_tumor" || lower === "no tumor") {
    return "No Tumor";
  }
  return className.charAt(0).toUpperCase() + className.slice(1).toLowerCase();
}
