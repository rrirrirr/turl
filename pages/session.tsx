import axios from 'axios'
import { unstable_getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { authOptions } from './api/auth/[...nextauth]'

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )
  console.log('session')
  console.log(session)
  return { props: { sess: session } }
}

export default function Session({ sess }) {
  // const { data: session, status } = useSession()

  console.log(sess)
  // console.log(session)

  return (
    <section>
      <p>SESS</p>
    </section>
  )
}
