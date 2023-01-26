import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createScoreObject } from '../../utils/utils'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'

import { GetServerSidePropsContext } from 'next'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const id = context.params?.id
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/games/${id}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
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

interface Props {
  tournament: Tournament
  teams: Team[]
  game: Game
  result_: Result
}

export default function Tournaments({
  tournament,
  teams,
  game,
  result_,
}: Props) {
  const [result, setResult] = useState(result_)

  if (!game) {
    return <p>Inget här</p>
  }

  return (
    <>
      <h1>{tournament.name}</h1>
      <section>
        {teams?.length
          ? teams.map((team, i) => (
              <span key={team.id}>
                <Link href={`/teamoverview/${team.id}`}>
                  <h3>{team.name}</h3>{' '}
                </Link>

                <b
                  onClick={() =>
                    setResult({
                      ...result,
                      [team.name]: {
                        score: (result[team.name].score || 0) + 1,
                      },
                    })
                  }
                >
                  {' '}
                  {result[team.name].score}
                </b>
                {game.teams?.length && i === game.teams.length - 1
                  ? ''
                  : ' vs '}
              </span>
            ))
          : 'Inga lag'}
      </section>
    </>
  )
}
