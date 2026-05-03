import axios from 'axios'

const DEFAULT_BASE = import.meta.env.VITE_API_BASE || 'https://lif-mkt-db.onrender.com/api'

export const client = axios.create({ baseURL: DEFAULT_BASE })

client.interceptors.request.use(config => {
  const token = localStorage.getItem('mhub-auth-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mhub-auth-token')
      localStorage.removeItem('mhub-auth-user')
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (username, password) => client.post('/auth/login', { username, password }),
}

export const itemsApi = {
  getAll: () => client.get('/items'),
  create: (data) => client.post('/items', data),
  update: (id, data) => client.put(`/items/${id}`, data),
  remove: (id) => client.delete(`/items/${id}`),
}
