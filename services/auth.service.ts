import axios from 'axios'
// import { getAuthorizationHeader } from '../utils/getAuthorizationHeader'

export async function login(username: string, password: string) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_DB_HOST}/auth/login`,
    {
      username,
      password,
    }
  )
  return { id: res.data.id, accessToken: res.data.access_token }
}
