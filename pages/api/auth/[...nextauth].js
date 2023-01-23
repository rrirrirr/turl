import axios from 'axios'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'email',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'admin@alf.com',
        },
        password: { label: 'Password', type: 'password', placeholder: 'test' },
      },

      async authorize(credentials, req) {
        const { username, password } = credentials
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/auth/login`,
          { username, password }
        )

        const user = res.data

        if (user) {
          return user
        } else {
          return null
        }
      },
    }),
  ],
  secret: 'Tho7NUzKXKEsmK7bqPtRyxdCjFeYP3A/TXxLCXvQjcQ=', //TEMP Do something
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token
        token.userId = user.user_id
        token.username = user.username
        token.isAdmin = user.isAdmin
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.name = token.username
        session.user.email = token.username
        session.user.image = ''
        session.user.accessToken = token.accessToken
        session.user.userId = token.userId
        session.user.username = token.username
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
}
export default NextAuth(authOptions)
