import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const projectsAPI = {
  getAll: (page = 1, limit = 50) => api.get('/projects', { params: { page, limit } }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const modelsAPI = {
  getAll: (page = 1, limit = 50) => api.get('/models', { params: { page, limit } }),
  getOne: (id) => api.get(`/models/${id}`),
  upload: (formData) => api.post('/models/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/models/${id}`),
}

export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getStats: () => api.get('/users/stats'),
}

export const annotationsAPI = {
  getByModel: (modelId) => api.get(`/annotations/model/${modelId}`),
  getOne: (id) => api.get(`/annotations/${id}`),
  create: (data) => api.post('/annotations', data),
  update: (id, data) => api.put(`/annotations/${id}`, data),
  delete: (id) => api.delete(`/annotations/${id}`),
  addImage: (annotationId, data) => api.post(`/annotations/${annotationId}/images`, data),
  deleteImage: (imageId) => api.delete(`/annotations/images/${imageId}`),
}

export const georeferencingAPI = {
  updateModelGeoreferencing: (modelId, data) => 
    api.put(`/models/${modelId}/georeferencing`, data),
  convertCoordinates: (modelId, data) => 
    api.post(`/models/${modelId}/convert-coordinates`, data),
}

export const photogrammetryAPI = {
  createProject: (data) => api.post('/photogrammetry/projects', data),
  getProject: (id) => api.get(`/photogrammetry/projects/${id}`),
  getProjectsByModel: (modelId) => api.get(`/photogrammetry/models/${modelId}/projects`),
  updateProject: (id, data) => api.put(`/photogrammetry/projects/${id}`, data),
  updateCalibration: (cameraId, data) => 
    api.put(`/photogrammetry/cameras/${cameraId}/calibration`, data),
}

export const volumetricVideoAPI = {
  createVideo: (data) => api.post('/volumetric-video/videos', data),
  getVideo: (id) => api.get(`/volumetric-video/videos/${id}`),
  getVideoByModel: (modelId) => api.get(`/volumetric-video/models/${modelId}/video`),
  getFrames: (videoId, params) => 
    api.get(`/volumetric-video/videos/${videoId}/frames`, { params }),
  addFrame: (videoId, data) => api.post(`/volumetric-video/videos/${videoId}/frames`, data),
  deleteVideo: (id) => api.delete(`/volumetric-video/videos/${id}`),
}

export default api
