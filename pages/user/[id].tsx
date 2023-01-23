import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { format } from 'date-fns'
import GameBox from '../../components/gameBox'

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  if (!session) {
    return {
      props: {
        user: null,
        tournaments: null,
        teams: null,
        games: null,
      },
    }
  }

  try {
    const userRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/users/${session.user.username}` //populate
    )

    const user = userRes.data
    const teams = user?.teams || []

    const tournaments = teams.length ? teams.map((team) => team.tournament) : []
    const games = teams.length ? teams.map((team) => team.games)[0] : []

    return {
      props: {
        user: user,
        tournaments: tournaments,
        teams: teams,
        games: games,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        user: null,
        tournaments: null,
        teams: null,
        games: null,
      },
    }
  }
}

export default function Tournaments({ user, tournaments, teams, games }) {
  if (!user) {
    return <p>Inget här</p>
  }

  return (
    <>
      <h1>{user.first_name}</h1>
      <section>
        <h2>Spelade Tävlingar</h2>
        <ul>
          {tournaments.length ? (
            tournaments.map((tournament) => (
              <li key={tournament.id}>
                <h3>
                  <Link href={`/tournaments/${tournament.id}`}>
                    {tournament.name}{' '}
                  </Link>{' '}
                </h3>
                (Lag{' '}
                <Link href={`blank`}>
                  {teams.find((team) => team.tournament.id === tournament.id)
                    ?.name || 'lag'}
                  )
                </Link>
                <h4>Matcher:</h4>
                <ul>
                  {games.length
                    ? games
                        .filter((game) => game.tournament.id === tournament.id)
                        .map((game) => (
                          <li key={game.id}>
                            <GameBox game={game} isAdmin={false} />
                          </li>
                        ))
                    : 'Inga matcher'}
                </ul>
              </li>
            ))
          ) : (
            <li>Inga tävlingar</li>
          )}
        </ul>
      </section>
    </>
  )
}
