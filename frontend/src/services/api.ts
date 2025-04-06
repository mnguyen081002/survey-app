import axios, { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Định nghĩa các interface
export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  json: string | object;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  aiSummary?: string;
}

export interface Question {
  name: string;
  title: string;
  type: string;
  isRequired?: boolean;
  choices?: Choice[];
  [key: string]: any; // Cho phép các thuộc tính bổ sung của SurveyJS
}

export interface Choice {
  value: string | number;
  text: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  questions: Question[];
  json: object;
  isActive?: boolean;
}

export interface UpdateSurveyDto extends Partial<CreateSurveyDto> {}

export interface CreateResponseDto {
  surveyId: string;
  answers: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Cấu trúc chuẩn của API response
 */
export interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: any;
}

/**
 * Cấu trúc API response có phân trang
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface SurveyStatItem {
  id: string;
  title: string;
  description?: string;
  responseCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DashboardStatsDto {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  averageResponses: number;
  completionRate: number;
  recentSurveys: SurveyStatItem[];
}

export interface AiSummaryDto {
  surveyId: string;
}

export interface AiSummaryResponseDto {
  summary: string;
}

// Tạo instance axios với config mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token và chuyển hướng về trang đăng nhập
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<any>>> => api.get('/auth/profile'),
};

// Surveys API
export const surveysApi = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Survey>>> =>
    api.get('/surveys', { params }),

  getMySurveys: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Survey>>> =>
    api.get('/surveys/my-surveys', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Survey>>> => api.get(`/surveys/${id}`),

  create: (data: CreateSurveyDto): Promise<AxiosResponse<ApiResponse<Survey>>> =>
    api.post('/surveys', data),

  update: (id: string, data: UpdateSurveyDto): Promise<AxiosResponse<ApiResponse<Survey>>> =>
    api.patch(`/surveys/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> => api.delete(`/surveys/${id}`),

  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<DashboardStatsDto>>> =>
    api.get('/surveys/dashboard/stats'),
};

// Responses API
export const responsesApi = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<SurveyResponse>>> =>
    api.get('/responses', { params }),

  getBySurvey: (
    surveyId: string,
    params?: PaginationParams,
  ): Promise<AxiosResponse<PaginatedResponse<SurveyResponse>>> =>
    api.get(`/responses`, { params: { surveyId, ...params } }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<SurveyResponse>>> =>
    api.get(`/responses/${id}`),

  submit: (data: CreateResponseDto): Promise<AxiosResponse<ApiResponse<SurveyResponse>>> =>
    api.post('/responses', data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> => api.delete(`/responses/${id}`),

  generateSummary: (
    data: AiSummaryDto,
  ): Promise<AxiosResponse<ApiResponse<AiSummaryResponseDto>>> =>
    api.post('/ai/generate-summary', data),
};

export const userApi = {
  getProfile: (): Promise<
    AxiosResponse<
      ApiResponse<{
        id: string;
        email: string;
        name: string;
        picture: string;
      }>
    >
  > => api.get('/auth/profile'),
};

export default api;
