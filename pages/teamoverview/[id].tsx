import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { GetStaticPropsContext } from 'next'

export async function getStaticPaths() {
  const teamsRes = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/teams`)
  const teams = teamsRes.data as Team[]

  const paths = teams.map((team) => ({
    params: { id: team.id },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: GetStaticPropsContext<{
    id: string
  }>
) {
  const id = context.params?.id

  try {
    const teamRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams/${id}`
    )
    const team = teamRes.data

    return {
      props: {
        team: team,
        players: team.player || [],
      },
    }
  } catch (error) {
    console.log(error)
    return { props: { team: null, players: [] } }
  }
}

// export async function getServerSideProps(context) {
//   const id = context.params.id

//   try {
//     const teamRes = await axios.get(
//       `${process.env.NEXT_PUBLIC_DB_HOST}/teams/${id}`
//     )
//     const team = teamRes.data

//     return {
//       props: {
//         team: team,
//         players: team.player || [],
//       },
//     }
//   } catch (error) {
//     console.log(error)
//     return { props: { team: null, players: [] } }
//   }
// }
interface Props {
  team: Team
  players: Player[]
}

export default function Team({ team, players }: Props) {
  if (!team) {
    return <div>Inget här</div>
  }
  return (
    <main className={styles.main}>
      <h1>TEAM {team.name}</h1>
      <section>
        {players.length ? (
          <>
            <h2>Spelare</h2>
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  {player.first_name} {player.last_name}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Inga spelare</p>
        )}
      </section>
    </main>
  )
}
