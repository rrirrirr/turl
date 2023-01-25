import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { createScoreObject } from '../utils/utils'
import { format } from 'date-fns'

export default function GameBoxAdmin(props: { game: Game }) {
  const [game, setGame] = useState(props.game)
  const [result, setResult] = useState<Result>(
    typeof game.result === 'string'
      ? JSON.parse(game.result)
      : createScoreObject(game?.teams || [])
  )
  const [update, setUpdate] = useState(false)
  const [active, setActive] = useState(game.active)

  async function updateResult(gameId: string, result: Result): Promise<void> {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/games/${gameId}`,
        {
          result: JSON.stringify(result),
        }
      )
      setUpdate(false)
      setResult(result)
    } catch (error) {
      console.log(error)
    }
  }

  async function changeActiveStatus(
    gameId: string,
    change: boolean
  ): Promise<void> {
    try {
      const update = change
        ? {
            active: change,
          }
        : { active: change, end_date: new Date() }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/games/${gameId}`,
        update
      )
      setActive(change)
      setGame({ ...game, end_date: res.data.end_date })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section>
      <p>{game.active ? 'Pågående' : game.end_date ? 'Avslutad' : ''}</p>
      <span> {format(new Date(game.start_date), 'yyyy-MM-dd HH:mm')}</span>

      <b>{game.name || ''}</b>
      <section>
        {game.teams?.length
          ? game.teams.map((team, i) => (
              <div key={`${team.id}${game.id}`}>
                <div
                  onClick={() => {
                    if (!active) {
                      return
                    }
                    setUpdate(true)
                    setResult({
                      ...result,
                      [team.name]: { score: result[team.name].score + 1 },
                    })
                  }}
                >
                  <h3> {result[team.name].score}</h3>
                </div>
                <div>
                  <Link href={`/team/overview/${team.id}`}>
                    <h3>{team.name}</h3>{' '}
                  </Link>
                </div>
              </div>
            ))
          : 'Inga lag'}
        <div>
          {update && (
            <button onClick={() => updateResult(game.id, result)}>
              Uppdatera
            </button>
          )}
          {active ? (
            <button onClick={() => changeActiveStatus(game.id, false)}>
              Avsluta match
            </button>
          ) : game.end_date ? (
            <button onClick={() => changeActiveStatus(game.id, true)}>
              Återuppta match
            </button>
          ) : (
            <button onClick={() => changeActiveStatus(game.id, true)}>
              Starta match
            </button>
          )}
        </div>
      </section>
    </section>
  )
}
