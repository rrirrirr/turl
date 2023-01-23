import axios from 'axios'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { User } from '../../../types/user'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'

export async function getServerSideProps({ params }) {
  if (params.id === 'new') {
    return {
      props: { tournament: { id: 'new', name: '', format: '', open: true } },
    }
  }
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${params.id}`
  )
  return { props: { tournament: res.data } }
}

export default function Edit({ tournament }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault()
    let res
    if (!session) {
      router.push(`/login`)
      return
    }
    try {
      if (tournament.id === 'new') {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`,
          {
            name: event.target.name.value,
            open: event.target.open.value === 'true',
            format: 'round robin',
            game_type: 'curling',
            min_num_players_in_team: +event.target.minplayers.value,
          },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        )
      } else {
        res = await axios.patch(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournament.id}`,
          { name: event.target.name.value, open: event.target.open.value }
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
          <label htmlFor="name">Turneringens namn:</label>
          <input
            placeholder={tournament.name}
            type="text"
            id="name"
            name="name"
            required
          />

          <label htmlFor="open">Öppen:</label>
          <select type="text" id="open" name="open" required>
            <option value={true}>Öppen</option>
            <option value={false}>Inbjudan</option>
          </select>

          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />

          <label htmlFor="location">Lokation</label>
          <input type="text" id="location" name="location" required />

          <label htmlFor="name">Max antal lag:</label>
          <input type="text" id="maxteams" name="maxteams" required />

          <label htmlFor="name">Minst antal spelare per lag:</label>
          <input
            type="number"
            min="0"
            max="20"
            id="minplayers"
            name="minplayer"
            required
          />

          <button type="submit">Submit</button>
        </form>
      </section>
    </>
  )
}
