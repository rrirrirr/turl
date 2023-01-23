import { useRouter } from 'next/router'
import { useState } from 'react'
// import { useLogin } from '../hooks/useLogin'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

type SessionData = {
  user: {
    username: string
    userId: string
    accessToken: string
    isAdmin: boolean
  }
  expires: string
}

export default function Login() {
  // const { login } = useLogin()
  // const { data: session } = useSession()

  const { data: session, status } = useSession()

  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault()
    const username = event.target.username.value
    const password = event.target.password.value
    const res = await signIn('credentials', { username, password })
  }

  if (session) {
    return (
      <div>
        Inloggad som {session.user.username} -{' '}
        <button onClick={() => signOut()}>logga ut</button>
        <Link href="/session">session</Link>
      </div>
    )
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          onChange={() => ''}
          type="text"
          id="username"
          name="username"
          required
          placeholder="admin@bajs.com"
          value="admin@bajs.com"
        />
        <label>Password</label>
        <input
          onChange={() => ''}
          type="text"
          id="password"
          name="password"
          required
          placeholder="test"
          value="test"
        />
        <button>Login</button>
      </form>
    </section>
  )
}
