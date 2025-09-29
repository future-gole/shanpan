import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const authApi = {
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  register: (userData) => axios.post(`${API_BASE_URL}/auth/register`, userData)
}