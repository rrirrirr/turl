import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
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

///Could be static?
export async function getServerSideProps(context) {
  const code = context.params.code

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  let user = null
  if (session) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users/${session.user.username}` //populate
      )
      user = res.data
      user.inTeam = user.teams.find((team) => team.team_code === code) || false
    } catch (error) {
      console.log(error)
    }
  }

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${code}`
    )

    const team = res.data[0]

    return {
      props: {
        user: user,
        team: team,
        tournament: team.tournament,
        players_: team.player,
      },
    }
  } catch (error) {
    console.log(error)
  }
  return { props: { team: null, tournament: null, players: [] } }
}

export default function Team({ user, team, tournament, players_ }) {
  const router = useRouter()
  const [players, setPlayers] = useState(players_)

  if (!team) {
    return <>Hittade inget</>
  }

  if (user) {
  }

  async function handleJoin(event: any): Promise<void> {
    console.log(user)
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users/${user.id}`,
        {
          team: team.id,
        }
      )
      console.log(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function handlePlayerAdd(event: any): Promise<void> {
    event.preventDefault()
    let res
    try {
      res = await axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/player`, {
        first_name: event.target.firstName.value,
        last_name: event.target.lastName.value,
        team: team.id,
      })

      if (res.status === 201) {
        const newPlayer = res.data
        setPlayers([...players, newPlayer])
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <main className={styles.main}>
      <h1>TEAM {team.name}</h1>
      {user && user.inTeam ? (
        <p>Ditt lag</p>
      ) : (
        <button onClick={() => handleJoin(team.code)}>Gå med i lag</button>
      )}
      <h2>{team.accepted ? 'antagen' : 'inte antagen'}</h2>
      <Link href={`/tournaments/${tournament.id}`}>
        <h3>turnering: {tournament.name}</h3>
      </Link>
      <section>
        <Link href={`${team.team_code}/info`} className={styles.navLink}>
          Info
        </Link>
        <Link href={`${team.team_code}/games`} className={styles.navLink}>
          Matcher
        </Link>
      </section>
      <section>
        <form onSubmit={handlePlayerAdd}>
          <label htmlFor="firstName">Fönamn:</label>
          <input type="text" id="firstName" name="firstName" required />

          <label htmlFor="lastName">Efternamn:</label>
          <input type="text" id="lastName" name="lastName" required />
          <button type="submit">Spara</button>
        </form>

        <ul>
          {players_.length ? (
            players_.map((player) => (
              <li key={player.id}>{player.first_name}</li>
            ))
          ) : (
            <li>Inga spelare</li>
          )}
        </ul>
      </section>
    </main>
  )
}
