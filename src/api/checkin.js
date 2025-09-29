import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const checkinApi = {
  checkin: (checkinData) => axios.post(`${API_BASE_URL}/checkins`, checkinData),
  list: (userId) => axios.get(`${API_BASE_URL}/checkins/${userId}`)
}
