import useSWR from 'swr'
import axios from 'axios'
import Link from 'next/link'
import { useState } from 'react'

export async function getStaticProps() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`)
  return { props: { tournaments: res.data } }
}

// const fetcher = (...args) => axios(...args).then((res) => res.data)

interface Props {
  tournaments: Tournament[]
}

export default function Tournaments(props: Props) {
  // const { data, error, isLoading } = useSWR(
  //   `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`,
  //   fetcher
  // )

  // if (error) return <div>Failed to load</div>
  // if (!data) return <div>Loading...</div>
  //   //

  const [tournaments, setTournaments] = useState(props.tournaments)

  async function handleDelete(id: string) {
    setTournaments(tournaments.filter((tournament) => tournament.id !== id))
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${id}`
    )
  }

  return (
    <>
      <section>
        <Link href="/tournaments/new/edit">Skapa ny turnering</Link>
      </section>
      <section>
        {tournaments.length ? (
          <ul>
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link href={`/tournaments/${tournament.id}`}>
                  {tournament.name}
                </Link>
                {' - '}
                <button onClick={() => handleDelete(tournament.id)}>
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <li>Inga turneringar</li>
        )}
      </section>
    </>
  )
}
