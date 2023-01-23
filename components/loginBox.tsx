import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

export default function LoginBox() {
  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault()
    const username = event.target.username.value
    const password = event.target.password.value
    const res = await signIn('credentials', { username, password })
  }

  return (
    <>
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
    </>
  )
}
