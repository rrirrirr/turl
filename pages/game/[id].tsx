import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createScoreObject } from '../../utils/utils'

type Result = any

export async function getServerSideProps({ params }) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/games/${params.id}`
    )
    const game = res.data
    const teams = game?.teams || []
    const tournament = game.tournament
    const result = game?.result || createScoreObject(teams)
    return {
      props: {
        tournament,
        teams,
        game,
        result_: result,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        tournament: null,
        teams: null,
        game: null,
        result: null,
      },
    }
  }
}

export default function Tournaments({ tournament, teams, game, result_ }) {
  if (!game) {
    return <p>Inget här</p>
  }

  const [result, setResult] = useState(result_)

  return (
    <>
      <h1>{tournament.name}</h1>
      <section>
        {teams?.length
          ? teams.map((team, i) => (
              <span key={team.id}>
                <Link href={`/team/overview/${team.id}`}>
                  <h3>{team.name}</h3>{' '}
                </Link>

                <b
                  onClick={() =>
                    setResult({
                      ...result,
                      [team.name]: { score: result[team.name].score + 1 },
                    })
                  }
                >
                  {' '}
                  {result[team.name].score}
                </b>
                {i === game.teams.length - 1 ? '' : ' vs '}
              </span>
            ))
          : 'Inga lag'}
      </section>
    </>
  )
}
