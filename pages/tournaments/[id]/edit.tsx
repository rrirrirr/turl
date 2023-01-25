import axios from 'axios'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { User } from '../../../types/user'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'
import { GetServerSidePropsContext } from 'next'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    id: string
  }>
) {
  const id = context.params?.id
  if (id === 'new') {
    return {
      props: { tournament: { id: 'new', name: '', format: '', open: true } },
    }
  }
  const tournamentRes = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${id}`
  )

  return { props: { tournament: tournamentRes.data } }
}

export default function Edit({ tournament }: { tournament: Tournament }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [startDate, setStartDate] = useState<Date>(
    tournament.start_date ? new Date(tournament.start_date) : new Date()
  )
  const [endDate, setEndDate] = useState<Date>(
    tournament.end_date ? new Date(tournament.end_date) : new Date()
  )

  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault()
    let res
    if (!session) {
      router.push(`/login`)
      return
    }
    try {
      const update = {
        name: event.target.name.value,
        open: event.target.open.value === 'true',
        start_date: startDate,
        end_date: endDate,
        format: event.target.format.value,
        game_type: event.target.gameType.value,
        min_num_players_in_team: +event.target.minplayers.value,
        team: +event.target.minplayers.value,
        max_num_teams: +event.target.maxNumTeams.value,
        description: event.target.description.value,
        venue: event.target.location.value,
      }

      if (tournament.id === 'new') {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`,
          update,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        )
      } else {
        res = await axios.patch(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournament.id}`,
          update,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        )
      }
      console.log(res)
      if (res.status === 201) {
        router.push(`/tournaments/${res.data.id}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (!session) {
    return <>No permission</>
  }

  return (
    <>
      <h1>{tournament.name}</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Turneringens namn:</label>
            <input
              placeholder={tournament.name}
              type="text"
              id="name"
              name="name"
              required
            />
          </div>
          <div>
            <label htmlFor="open">Öppen:</label>
            <select id="open" name="open" required>
              <option value={'true'}>Öppen</option>
              <option value={'false'}>Inbjudan</option>
            </select>
          </div>
          <div>
            Startdatum
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
            Slutdatum
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </div>
          <div>
            <select id="format" name="format" required>
              <option value="round robin">Round Robin</option>
            </select>
          </div>
          <div>
            <select id="gameType" name="gameType" required>
              <option value="hockey">Hockey</option>
            </select>
          </div>
          <div>
            <label htmlFor="location">Lokation</label>
            <input type="text" id="location" name="location" required />
          </div>
          <div>
            <label htmlFor="maxNumTeams">Max antal lag:</label>
            <input
              type="number"
              min="2"
              max="128"
              id="maxNumTeams"
              name="maxNumTeams"
              required
            />
          </div>
          <div>
            <label htmlFor="name">Minst antal spelare per lag:</label>
            <input
              type="number"
              min="0"
              max="20"
              id="minplayers"
              name="minplayer"
              required
            />
          </div>
          <div>
            <label htmlFor="description">Beskrivning:</label>
            <input type="text" id="description" name="description" required />
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>
    </>
  )
}
