import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { Button, Center, Group, TextInput } from '@mantine/core'
import styles from '../styles/Home.module.css'
import { useForm } from '@mantine/form'
import { IconMail, IconMailbox, IconPassword } from '@tabler/icons-react'

export default function LoginBox() {
  const form = useForm({
    initialValues: {
      username: 'admin@bajs.com',
      password: 'test',
    },

    validate: {},
  })

  async function handleSubmit({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<void> {
    try {
      const res = await signIn('credentials', { username, password })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Center>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <div>
          <TextInput
            label="Email"
            icon={<IconMail />}
            type="text"
            id="username"
            name="username"
            {...form.getInputProps('username')}
            required
          />
        </div>
        <div>
          <TextInput
            label="Password"
            type="text"
            icon={<IconPassword />}
            id="password"
            name="password"
            {...form.getInputProps('password')}
            required
            placeholder="test"
          />
        </div>
        <Group position="center" mt="xl">
          <Button color="red" type="submit">
            Login
          </Button>
        </Group>
      </form>
    </Center>
  )
}
