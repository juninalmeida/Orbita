import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Same-Origin Policy inclui os cookies mesmo sendo cross-origin.
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      window.location.pathname === '/login' ||
      window.location.pathname === '/register'

    if (error.response?.status === 401 && !isAuthRoute) {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
