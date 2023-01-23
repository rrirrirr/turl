import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createScoreObject } from '../utils/utils'
import { format } from 'date-fns'

export default function GameBox({ game }) {
  const [result, setResult] = useState(
    game.result || createScoreObject(game.teams)
  )
  const [update, setUpdate] = useState(false)

  return (
    <section>
      <p>{game.active ? 'Pågående' : game.end_date ? 'Avslutad' : ''}</p>
      <span> {format(new Date(game.start_date), 'yyyy-MM-dd HH:mm')}</span>

      <b>{game.name || ''}</b>
      <section>
        {game.teams?.length
          ? game.teams.map((team, i) => (
              <div key={team.id}>
                <div>
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
      </section>
    </section>
  )
}
