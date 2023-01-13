import axios from 'axios'
import { useRouter } from 'next/router'

// export async function getStaticPaths() {
//   const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/invitations`)
//   const invites = res.data

//   const paths = invites.map((invite) => ({
//     params: { code: invite.code },
//   }))
//   return { paths, fallback: false }
// }

// export async function getStaticProps({ params }) {
//   const res = await axios.get(
//     `${process.env.NEXT_PUBLIC_DB_HOST}/invitations/${params.code}`
//   )
//   return { props: { data: res.data } }
// }

export async function getServerSideProps({ params }) {
  const invite = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/invitations?code=${params.code}`
  )

  const tournament = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${invite.data.tournament}`
  )

  return { props: { invite: invite.data, tournament: tournament.data } }
}

export default function Invite({ invite, tournament }) {
  const router = useRouter()
  console.log(tournament)

  async function handleSubmit(event) {
    event.preventDefault()
    const res = await axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/teams`, {
      name: event.target.name.value,
      tournament: invite.tournament,
    })
    console.log(res)
    if (res.status === 201) {
      router.push(`/tournaments/${invite.tournament}`)
    }
  }

  return (
    <section>
      <h1>Anmälan till {tournament.name}</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Lagets namn:</label>
        <input type="text" id="name" name="name" />
        <button type="submit">Submit</button>
      </form>
    </section>
  )
}
