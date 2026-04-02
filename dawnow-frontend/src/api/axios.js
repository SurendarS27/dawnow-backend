import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attach JWT
API.interceptors.request.use(config => {
    const token = localStorage.getItem('dawnow_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
}, error => {
    return Promise.reject(error)
})

// Response interceptor: handle 401 and errors
API.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('dawnow_token')
            localStorage.removeItem('dawnow_user')
            window.location.href = '/login'
        }

        if (err.response?.status === 403) {
            // Role conflict or permission issue
            console.error('Permission denied: 403 Forbidden', err.response?.data?.message)
            
            // If the error is specifically a role authorization failure (e.g., from multi-tab login overrides), redirect
            if (err.response?.data?.message && err.response.data.message.includes('Access denied')) {
                window.location.href = '/';
            }
        }

        // Handle timeout
        if (err.code === 'ECONNABORTED') {
            err.message = 'Request timed out. Please try again.'
        }

        return Promise.reject(err)
    }
)

export default API
