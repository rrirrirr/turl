import { Button, Container, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Signup() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const form = useForm({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      telephoneNum: '',
      password: '',
    },

    validate: {},
  })

  const user = (session?.user as AuthUser) || null
  if (session) {
    router.push(`/user/${user.userId}`)
  }

  interface UserS {
    username: string
    firstName: string
    lastName: string
    telephoneNum: string
    password: string
  }

  async function handleSubmit({
    username,
    firstName,
    lastName,
    telephoneNum,
    password,
  }: UserS): Promise<void> {
    try {
      const userRes = await axios.post(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users`,
        {
          first_name: firstName,
          last_name: lastName,
          isAdmin: false,
          email: username,
          password: password,
          telephone_num: telephoneNum,
        }
      )
      if (userRes.status === 201) {
        const user = userRes.data
        const loginRes = await signIn('credentials', {
          username: username,
          password: password,
        })
        router.push(`/user/${user.id}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section>
      <Container size="xs">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            label="Email"
            type="text"
            {...form.getInputProps('username')}
            required
          />
          <TextInput
            withAsterisk
            label="Förnamn"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            withAsterisk
            required
            label="Efternamn"
            {...form.getInputProps('lastName')}
          />
          <TextInput
            label="Telefonnummer"
            {...form.getInputProps('telephoneNum')}
          />
          <TextInput
            label="Lösenord"
            type="text"
            {...form.getInputProps('password')}
            required
          />

          <Button color="red" type="submit" my="sm">
            Skapa
          </Button>
        </form>
      </Container>
    </section>
  )
}
