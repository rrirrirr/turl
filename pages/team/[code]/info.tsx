import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'

export async function getStaticPaths() {
  const teamsRes = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/teams`)
  const teams = teamsRes.data

  const paths = teams.map((team) => ({
    params: { code: team.team_code },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const teamRes = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${params.code}`
  )
  const team = teamRes.data[0]

  return {
    props: { team: team },
  }
}

///Could be static?
// export async function getServerSideProps({ params }) {
//   try {
//     const res = await axios.get(
//       `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${params.code}`
//     )
//     const team = res.data[0]

//     return {
//       props: { team: team },
//     }
//   } catch (error) {
//     console.log(error)
//   }
//   return { props: { team: null } }
// }

export default function Info({ team }) {
  const router = useRouter()

  if (!team) {
    return <>Hittade inget</>
  }

  return (
    <main className={styles.main}>
      <section>
        <h2>Spelare</h2>
        {team.player.length ? (
          <ul>
            {team.player.map((player) => (
              <li key={player.id}>
                <p>
                  {player.first_name} {player.last_name}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          'Inga spelare'
        )}
      </section>
    </main>
  )
}
