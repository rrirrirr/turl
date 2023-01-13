import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'

export async function getStaticPaths() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`)
  const tournaments = res.data

  const paths = tournaments.map((tournament) => ({
    params: { id: tournament.id },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const tournament = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${params.id}`
  )

  // const invites = { data: 'n' }
  const invites = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/invitations?tournament=${params.id}`
  )

  const teams = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/teams?tournament=${params.id}`
  )

  return {
    props: {
      tournament: tournament.data,
      invitations: invites.data,
      teams: teams.data,
    },
  }
}

export default function Tournaments({ tournament, invitations, teams }) {
  const [invites, setInvites] = useState(invitations)

  async function handleCreateInvite(unique) {
    setInvites([
      ...invites,
      { id: 'new', code: '...', unique: !tournament.open },
    ])
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invitations`,
      {
        tournament: tournament.id,
        unique: !tournament.open,
      }
    )
    setInvites([...invites, { id: res.data.id, code: res.data.code, unique }])
  }

  async function handleDeleteInvite(id: string) {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invitations/${id}`
    )
    setInvites(invites.filter((invite) => invite.id !== id))
  }

  return (
    <section>
      <>
        <h1>{tournament.name}</h1>
        <div>
          <Link href={`${tournament.id}/edit`}>Ändra</Link>
        </div>
        <h2>{tournament.open ? 'Öppen tävling' : 'Endast inbjudan'}</h2>
        <button onClick={() => handleCreateInvite(true)}>Skapa inbjudan</button>
        {invites.length ? (
          <ul>
            {invites.map((invitation) => (
              <li key={invitation.id}>
                <Link href={`/invite/${invitation.code}`}>
                  {invitation.code}
                </Link>{' '}
                - <b>{invitation.unique ? 'Inte använd' : 'Öppen inbjudan'}</b>
                {' - '}
                <button onClick={() => handleDeleteInvite(invitation.id)}>
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>...</p>
        )}
        {teams.length ? (
          <ul>
            {' '}
            {teams.map((team) => (
              <li key={team.id}>{team.name}</li>
            ))}
          </ul>
        ) : (
          <p>Inga anmälda lag</p>
        )}
        <section></section>
      </>
    </section>
  )
}
