export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  primaryDiagnosis: string;
  referralCity: string;
  baselineDate: string;
}

export interface ScanRecord {
  id: string;
  patientId: string;
  date: string;
  originalImageUrl: string;
  gradCamUrl: string;
  tumorAreaPixels: number;
  confidence: number;
  severity: "Routine" | "Critical";
  diagnosis: string;
  notes?: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  flightTimeMin: number;
  hasNeuroICU: boolean;
  currentBedCapacity: number;
  equipmentLevel: "Level 1 Trauma" | "Level 2 Trauma" | "Comprehensive Neuro";
  specialties: string[];
  helipadAvailable: boolean;
  contactPhone: string;
  rating: number;
}

// ---------------------------------------------------------------------------
// PRE-POPULATED MOCK PATIENT DATA
// ---------------------------------------------------------------------------

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PT-8821",
    name: "Eleanor Vance",
    age: 54,
    gender: "Female",
    riskLevel: "Critical",
    primaryDiagnosis: "Glioblastoma Multiforme (IDH-Wildtype)",
    referralCity: "Jaipur",
    baselineDate: "2025-10-14",
  },
  {
    id: "PT-4930",
    name: "Marcus Holloway",
    age: 42,
    gender: "Male",
    riskLevel: "Moderate",
    primaryDiagnosis: "Sphenoid Wing Meningioma",
    referralCity: "Mumbai",
    baselineDate: "2025-12-02",
  },
  {
    id: "PT-1204",
    name: "Sarah Chen",
    age: 29,
    gender: "Female",
    riskLevel: "Low",
    primaryDiagnosis: "Post-Resection Remission (Nominal)",
    referralCity: "Delhi",
    baselineDate: "2026-01-20",
  },
];

// ---------------------------------------------------------------------------
// PRE-POPULATED SCANS (Patient 1 shows upward progression trend)
// ---------------------------------------------------------------------------

export const INITIAL_SCANS: ScanRecord[] = [
  // Patient 1: Eleanor Vance (Aggressive Upward Growth)
  {
    id: "SCN-101",
    patientId: "PT-8821",
    date: "2025-10-14",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 1840,
    confidence: 0.942,
    severity: "Routine",
    diagnosis: "Glioma (Grade II/III Focal Infiltration)",
    notes: "Initial diagnostic MRI. Mild peritumoral edema identified in left parietal lobe.",
  },
  {
    id: "SCN-102",
    patientId: "PT-8821",
    date: "2026-01-08",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 3410,
    confidence: 0.978,
    severity: "Routine",
    diagnosis: "Glioma (Grade III Anaplastic Shift)",
    notes: "Follow-up scan at 12 weeks. Tumor boundary expanding along subcortical white matter tracks.",
  },
  {
    id: "SCN-103",
    patientId: "PT-8821",
    date: "2026-04-19",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 6120,
    confidence: 0.991,
    severity: "Critical",
    diagnosis: "Glioblastoma (Grade IV Transformation)",
    notes: "Accelerated mitotic expansion. Ring enhancement with central necrosis visible on T1-Gd.",
  },
  {
    id: "SCN-104",
    patientId: "PT-8821",
    date: "2026-10-09",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 9280,
    confidence: 0.998,
    severity: "Critical",
    diagnosis: "Glioblastoma Multiforme (Focal Mass Effect)",
    notes: "Current live scan: 9,280 px lesion core. Significant midline shift requiring emergency catchment triage.",
  },

  // Patient 2: Marcus Holloway (Stable / Slow Indolent Growth)
  {
    id: "SCN-201",
    patientId: "PT-4930",
    date: "2025-12-02",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 2400,
    confidence: 0.931,
    severity: "Routine",
    diagnosis: "Meningioma (Benign Extra-Axial)",
    notes: "Incidental dural tail sign. Minimal compression on adjacent brain parenchyma.",
  },
  {
    id: "SCN-202",
    patientId: "PT-4930",
    date: "2026-06-15",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 2580,
    confidence: 0.945,
    severity: "Routine",
    diagnosis: "Meningioma (Slow Indolent Kinetics)",
    notes: "Six-month interval surveillance. Less than 8% volumetric change; continue conservative monitoring.",
  },

  // Patient 3: Sarah Chen (Post-Op Remission / Clean)
  {
    id: "SCN-301",
    patientId: "PT-1204",
    date: "2026-01-20",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 0,
    confidence: 0.989,
    severity: "Routine",
    diagnosis: "No Tumor Detected",
    notes: "Post-surgical cavity clear. No residual enhancement along resection margins.",
  },
  {
    id: "SCN-302",
    patientId: "PT-1204",
    date: "2026-08-11",
    originalImageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    gradCamUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    tumorAreaPixels: 0,
    confidence: 0.994,
    severity: "Routine",
    diagnosis: "No Tumor Detected",
    notes: "Clean 6-month post-op scan. Symmetrical ventricular anatomy with zero recurrence salience.",
  },
];

// ---------------------------------------------------------------------------
// MOCK GEOSPATIAL CATCHMENT HOSPITAL NETWORK
// ---------------------------------------------------------------------------

export const REGIONAL_CATCHMENT_FACILITIES: HospitalFacility[] = [
  {
    id: "HOSP-01",
    name: "SMS Medical College & Hospital — Advanced Neurotrauma Centre",
    lat: 26.892,
    lng: 75.819,
    distanceKm: 4.8,
    driveTimeMin: 14,
    flightTimeMin: 6,
    hasNeuroICU: true,
    currentBedCapacity: 4,
    equipmentLevel: "Level 1 Trauma",
    specialties: ["Emergency Neurosurgery", "Intraoperative MRI", "Stereotactic Navigation"],
    helipadAvailable: true,
    contactPhone: "+91 141 251 8222",
    rating: 4.8,
  },
  {
    id: "HOSP-02",
    name: "Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)",
    lat: 26.871,
    lng: 75.808,
    distanceKm: 8.2,
    driveTimeMin: 22,
    flightTimeMin: 8,
    hasNeuroICU: true,
    currentBedCapacity: 2,
    equipmentLevel: "Comprehensive Neuro",
    specialties: ["5-ALA Fluorescence", "CyberKnife Radiosurgery", "Neuro-Oncology ICU"],
    helipadAvailable: true,
    contactPhone: "+91 141 270 0107",
    rating: 4.9,
  },
  {
    id: "HOSP-03",
    name: "Apex Super Speciality Hospital & Neurovascular Institute",
    lat: 26.852,
    lng: 75.823,
    distanceKm: 12.5,
    driveTimeMin: 28,
    flightTimeMin: 11,
    hasNeuroICU: true,
    currentBedCapacity: 5,
    equipmentLevel: "Level 2 Trauma",
    specialties: ["Endovascular Embolization", "Brain Tumor ICU", "Functional Neuromonitoring"],
    helipadAvailable: false,
    contactPhone: "+91 141 275 1871",
    rating: 4.6,
  },
  {
    id: "HOSP-04",
    name: "Fortis Escorts Neurosciences & Spine Centre",
    lat: 26.839,
    lng: 75.801,
    distanceKm: 16.1,
    driveTimeMin: 34,
    flightTimeMin: 12,
    hasNeuroICU: false,
    currentBedCapacity: 0, // Zero capacity for triage test
    equipmentLevel: "Level 2 Trauma",
    specialties: ["Spine Surgery", "General Neurology", "Diagnostic PET-CT"],
    helipadAvailable: false,
    contactPhone: "+91 141 254 7000",
    rating: 4.5,
  },
  {
    id: "HOSP-05",
    name: "Jaipur National University Institute for Medical Sciences",
    lat: 26.812,
    lng: 75.842,
    distanceKm: 21.4,
    driveTimeMin: 41,
    flightTimeMin: 15,
    hasNeuroICU: true,
    currentBedCapacity: 6,
    equipmentLevel: "Comprehensive Neuro",
    specialties: ["Clinical Trials", "Volumetric Radiotherapy", "Neuro-Rehabilitation"],
    helipadAvailable: true,
    contactPhone: "+91 141 719 9000",
    rating: 4.4,
  },
];

// Helper to estimate tumor pixel area from model output
export function estimateTumorAreaFromPrediction(
  predictionClass: string,
  confidence: number
): number {
  const norm = predictionClass.toLowerCase().replace(/[^a-z]/g, "");
  if (norm.includes("notumor") || norm.includes("no_tumor") || norm === "normal") {
    return 0;
  }
  if (norm.includes("glioma")) {
    return Math.round(confidence * 8500 + 780);
  }
  if (norm.includes("meningioma")) {
    return Math.round(confidence * 3600 + 420);
  }
  if (norm.includes("pituitary")) {
    return Math.round(confidence * 2400 + 310);
  }
  return Math.round(confidence * 4500 + 500);
}
