import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import GameBox from '../../../components/gameBox'
import { GetServerSidePropsContext } from 'next'

///Could be static?
export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    code: string
  }>
) {
  const code = context?.params?.code
  try {
    const teamRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${code}`
    )
    const team = teamRes.data[0]
    const games = team?.games || []
    console.log(team)
    return {
      props: { team: team, games: games },
    }
  } catch (error) {
    console.log(error)
  }
  return { props: { team: null, tournament: null } }
}

interface Props {
  team: Team
  games: Game[]
}

export default function TeamGames({ team, games }: Props) {
  const [showUpcomingGames, setShowUpcomingGames] = useState<Game[] | boolean>(
    false
  )
  const [showPlayedGames, setShowPlayedGames] = useState<Game[] | boolean>(
    false
  )

  const upcomingGames = games.filter(
    (game) => new Date(game.start_date) > new Date()
  )
  const playedGames = games.filter(
    (game) => new Date(game.start_date) <= new Date()
  )

  if (!team) {
    return <>Hittade inget</>
  }

  return (
    <main className={styles.main}>
      <h1>TEAM {team.name}</h1>{' '}
      <section>
        <Link href={`/team/${team.team_code}/info`} className={styles.navLink}>
          Info
        </Link>
      </section>
      <section>
        {showUpcomingGames ? (
          <>
            <button onClick={() => setShowUpcomingGames(false)}>
              Göm kommande matcher
            </button>
            <section>
              {upcomingGames.length ? (
                <ul>
                  {upcomingGames.map((game, i) => (
                    <li key={game.id}>
                      <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
                      <GameBox game={game} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Inga matcher</p>
              )}
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowUpcomingGames(true)}>
              Visa kommande matcher
            </button>
          </>
        )}
        {showPlayedGames ? (
          <>
            <button onClick={() => setShowPlayedGames(false)}>
              Göm spelade och pågående matcher
            </button>
            <section>
              {playedGames.length ? (
                <ul>
                  {playedGames.map((game, i) => (
                    <li key={game.id}>
                      <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
                      <GameBox game={game} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Inga matcher</p>
              )}
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowPlayedGames(true)}>
              Visa spelade matcher
            </button>
          </>
        )}
      </section>
    </main>
  )
}
