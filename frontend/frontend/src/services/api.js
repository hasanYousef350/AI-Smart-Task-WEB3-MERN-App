import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (data) => api.post("/login", data),
  signup: (data) => api.post("/signup", data),
  logout: () => api.post("/logout"),
  forgotPassword: (data) => api.post("/api/forgot-password", data),
  resetPassword: (data) => api.post("/api/reset-password", data),
  getCurrentUser: () => api.get("/api/me"), // Assuming this endpoint exists
  googleAuth: () => (window.location.href = `${API_BASE_URL}/auth/google`),
}

// Task API
export const taskAPI = {
  getAllTasks: () => api.get("/tasks"),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post("/createTask", data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
}

// Team API
export const teamAPI = {
  sendInvites: (data) => api.post("/api/send-invites", data),
  getTeamMembers: () => api.get("/api/team-members"),
  acceptInvite: (data) => api.post("/api/accept-invite", data),
}

// File API
export const fileAPI = {
  uploadFiles: (formData) =>
    api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getFiles: () => api.get("/files"),
}

// Calendar API
export const calendarAPI = {
  getCalendarEvents: () => api.get("/api/calendar-events"),
  createAgenda: (data) => api.post("/api/agendas", data),
  getAgendas: () => api.get("/api/agendas"),
  deleteAgenda: (id) => api.delete(`/api/agendas/${id}`),
}

// Analytics API
export const analyticsAPI = {
  getAnalyticsData: () => api.get("/api/analytics-data"),
}

export default api
