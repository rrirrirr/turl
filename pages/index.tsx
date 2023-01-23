import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import LoginBox from '../components/loginBox'
import styles from '../styles/Home.module.css'
import { authOptions } from './api/auth/[...nextauth]'
import { User } from '../types/user'
import Link from 'next/link'

// type Props = { props: { session: Session | null } }

// export async function getServerSideProps(
//   context: GetServerSidePropsContext
// ): Promise<Props> {
//   const session: Session | null = await unstable_getServerSession(
//     context.req,
//     context.res,
//     authOptions
//   )
//   return { props: { session: session } }
// }

// export default function Home({ session }: { session: Session }) {
export default function Home() {
  const { data: session, status } = useSession()

  const user = (session?.user as User) || null
  return (
    <>
      <Head>
        <title>Turl</title>
      </Head>
      <main className={styles.main}>
        {session ? (
          <>
            <p>Inloggad som {user.username}</p>
            <button onClick={() => signOut()}>Logga ut</button>
            <section>
              <Link href={`/user/${user.userId}`} className={styles.navLink}>
                Dina tävlingar
              </Link>
              <Link href="/tournaments" className={styles.navLink}>
                Tävlingar
              </Link>
              <Link href="/history" className={styles.navLink}>
                Din historik
              </Link>
              <Link href="/tournaments/new/edit" className={styles.navLink}>
                Skapa tävling
              </Link>
            </section>
          </>
        ) : (
          <>
            <LoginBox />
          </>
        )}
      </main>
    </>
  )
}
