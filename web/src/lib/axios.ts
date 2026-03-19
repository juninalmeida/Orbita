import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Same-Origin Policy inclui os cookies mesmo sendo cross-origin.
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error) // devolve o erro para que quem chamou possa tratar
  },
)
