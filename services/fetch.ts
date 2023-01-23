import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DB_HOST,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = 'Your token goes over here'
    if (token && config.headers !== undefined) {
      config.headers.accessToken = token
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)
