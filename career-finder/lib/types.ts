// lib/types.ts - Updated to match backend expectations

// Core prediction interfaces (updated to match backend)
export interface PredictionInput {
  jobTitle: string;
  yearsExperience: number;
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive'; // Fixed to match backend
  companyLocation: string;
  companySize: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  remoteRatio: number;
  requiredSkills: string[];
  benefits: string[];
  jobDescription: string;
  benefitsScore?: number;
}

export interface PredictionResult {
  predictedSalary: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  similarJobs: number;
  marketPosition: 'Top Tier' | 'Above Average' | 'Average' | 'Below Average' | 'Unknown'
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  metadata: {
    model_version: string;
    model_type: string;
    model_accuracy: number;
    prediction_timestamp: string;
    features_processed: number;
  };
}

// API response wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
}


// Type guards for validation
export const isValidExperienceLevel = (level: string): level is PredictionInput['experienceLevel'] => {
  return ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].includes(level);
}

export const isValidCompanySize = (size: string): size is PredictionInput['companySize'] => {
  return ['Small', 'Medium', 'Large', 'Enterprise'].includes(size);
}

export const isValidMarketPosition = (position: string): position is PredictionResult['marketPosition'] => {
  return ['Below Average', 'Average', 'Above Average', 'Top Tier'].includes(position);
}

// Validation constants
export const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level', 
  'Senior Level',
  'Executive'
] as const;

export const COMPANY_SIZES = [
  'Small',
  'Medium',
  'Large',
  'Enterprise'
] as const;

export const SUPPORTED_LOCATIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Denmark',
  'Sweden',
  'Singapore',
  'Israel',
  'Austria',
  'India',
  'China',
  'Other'
] as const;

export interface ClusterData {
  clusterId: number;
  name: string;
  averageSalary: number;
  jobCount: number;
  description: string;
  characteristics: string[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

export interface ModelMetrics {
  r2Score: number;
  meanAbsoluteError: number;
  crossValidationScore: number;
  totalSamples: number;
}

export interface JobMarketTrend {
  period: string;
  averageSalary: number;
  jobCount: number;
  topSkills: string[];
}

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  q25: number;
  q75: number;
}

export interface GeographicSalaryData {
  location: string;
  averageSalary: number;
  jobCount: number;
  salaryRange: SalaryRange;
  costOfLivingIndex?: number;
}

export interface SkillImpact {
  skill: string;
  salaryBoost: number;
  frequency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ExperienceLevelData {
  level: string;
  averageSalary: number;
  salaryRange: SalaryRange;
  jobCount: number;
  commonTitles: string[];
  requiredSkills: string[];
}

export interface CompanyMetrics {
  size: string;
  averageSalary: number;
  benefits: number;
  remoteWorkPercentage: number;
  jobCount: number;
}

export interface PredictionHistory {
  id: string;
  timestamp: Date;
  input: PredictionInput;
  result: PredictionResult;
}

export interface DashboardFilters {
  experienceLevel?: string[];
  location?: string[];
  companySize?: string[];
  jobTitle?: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  remoteWork?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form option types for dropdowns
export interface FormOption<T = string> {
  value: T;
  label: string;
  description?: string;
}

export type ExperienceLevelOption = FormOption<PredictionInput['experienceLevel']>;
export type CompanySizeOption = FormOption<PredictionInput['companySize']>;
export type LocationOption = FormOption<typeof SUPPORTED_LOCATIONS[number]>;

// Enhanced types for error handling
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Backend integration types
export interface BackendConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  model_loaded: boolean;
  version: string;
  config_paths: {
    model_path: string;
    scaler_path: string;
    feature_names_path: string;
  };
}

export interface DebugInfo {
  flask_config_keys: string[];
  model_loaded: boolean;
  paths: {
    model_path: string;
    scaler_path: string;
    feature_names_path: string;
  };
  file_exists: {
    model: boolean;
    scaler: boolean;
    feature_names: boolean;
  };
  working_directory: string;
  script_directory: string;
  preprocessor_features: number | string;
  model_info?: {
    model_type: string;
    model_version: string;
    training_accuracy: number;
    is_loaded: boolean;
    has_scaler: boolean;
    feature_count: number;
    feature_names: string[];
    top_features?: Array<{
      name: string;
      importance: number;
    }>;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export commonly used type combinations
export type PredictionFormData = RequiredFields<PredictionInput, 'jobTitle' | 'yearsExperience' | 'experienceLevel' | 'companyLocation'>;

export type PredictionSummary = Pick<PredictionResult, 'predictedSalary' | 'marketPosition' | 'similarJobs'>;

// Constants for form validation
export const VALIDATION_RULES = {
  jobTitle: {
    minLength: 2,
    maxLength: 200,
    required: true
  },
  yearsExperience: {
    min: 0,
    max: 50,
    required: true
  },
  remoteRatio: {
    min: 0,
    max: 100,
    step: 10
  },
  requiredSkills: {
    maxItems: 20,
    maxLength: 100
  },
  benefits: {
    maxItems: 15,
    maxLength: 100
  },
  jobDescription: {
    maxLength: 10000
  }
} as const;