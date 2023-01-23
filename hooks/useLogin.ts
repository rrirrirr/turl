import { login as loginService } from '../services/auth.service'
import { setCookie } from 'cookies-next'
import { User } from '../types/user'

export function useLogin() {
  async function login(username: string, password: string): Promise<User> {
    const user = await loginService(username, password)
    if (user) {
      setCookie('currentUser', JSON.stringify(user))
    }
    return user
  }

  return { login }
}
