import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Signup() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const user = (session?.user as AuthUser) || null
  if (session) {
    router.push(`/user/${user.userId}`)
  }

  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault()
    try {
      const userRes = await axios.post(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users`,
        {
          first_name: event.target.firstName.value,
          last_name: event.target.lastName.value,
          isAdmin: false,
          email: event.target.email.value,
          password: event.target.password.value,
          telephone_num: event.target.telephoneNum.value || null,
        }
      )
      if (userRes.status === 201) {
        const user = userRes.data
        const loginRes = await signIn('credentials', {
          username: user.email,
          password: event.target.password.value,
        })
        router.push(`/user/${user.id}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input type="text" id="email" name="email" required />

          <label htmlFor="firstName">Förnamn</label>
          <input type="text" id="firstName" name="firstName" required />

          <label htmlFor="lastName">Efternamn</label>
          <input type="text" id="lastName" name="lastName" required />

          <label htmlFor="name">Telefonnummer (optional)</label>
          <input type="text" id="telephoneNum" name="telephoneNum" />

          <label htmlFor="password">Lösenord</label>
          <input type="text" id="password" name="password" required />

          <button type="submit">Skapa</button>
        </form>
      </section>
    </>
  )
}
