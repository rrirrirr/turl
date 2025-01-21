import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import LoginBox from '../components/loginBox'
import styles from '../styles/Home.module.css'
import { authOptions } from './api/auth/[...nextauth]'
import Link from 'next/link'
import { Button } from '@mantine/core'

export default function Home() {
  const { data: session, status } = useSession()

  const user = (session?.user as AuthUser) || null
  return (
    <>
      <Head>
        <title>Turl</title>
      </Head>
      <main className={styles.main}>
        <section className={styles.centerVertical}>
          {session ? (
            <>
              <p>Inloggad som {user.username}</p>
              <button onClick={() => signOut()}>Logga ut</button>
              <Button
                component={Link}
                href={`/user/${user.userId}`}
                className={styles.navLink}
              >
                Dina tävlingar
              </Button>
              <Button
                component={Link}
                href="/tournaments"
                className={styles.navLink}
              >
                Öppna Tävlingar
              </Button>
              <Button
                component={Link}
                href="/history"
                className={styles.navLink}
              >
                Din historik
              </Button>
              <Button
                component={Link}
                href="/tournaments/new/edit"
                className={styles.navLink}
              >
                Skapa tävling
              </Button>
            </>
          ) : (
            <>
              <LoginBox />
              <Button component={Link} href="/signup">
                Skapa Konto
              </Button>
            </>
          )}
        </section>
      </main>
    </>
  )
}
