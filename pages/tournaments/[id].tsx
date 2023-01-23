import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GameCreator } from '../../components/gameCreator'
import { compareAsc, format } from 'date-fns'
import GameBoxAdmin from '../../components/gameBoxAdmin'
import GameBox from '../../components/gameBox'

export async function getStaticPaths() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`)
  const tournaments = res.data

  const paths = tournaments.map((tournament) => ({
    params: { id: tournament.id },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  try {
    const tournament = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${params.id}`
    )

    const invites = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites?tournament=${params.id}`
    )

    const teams = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams?tournament=${params.id}`
    )

    const games = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/games?tournament=${params.id}`
    )
    const sortedGames = games.data.sort((a, b) =>
      compareAsc(new Date(a.start_date), new Date(b.start_date))
    )

    return {
      props: {
        tournament: tournament.data,
        invites_: invites.data,
        teams_: teams.data,
        games_: sortedGames,
        // games_: games.data,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        tournament: null,
        invites_: null,
        teams_: null,
        games_: null,
      },
    }
  }
}

export default function Tournaments({ tournament, invites_, teams_, games_ }) {
  if (!tournament) {
    return <p>Inget här</p>
  }

  const [invites, setInvites] = useState(invites_)
  const [teams, setTeams] = useState(teams_)
  const [games, setGames] = useState(games_)
  const { data: session, status } = useSession()

  async function handleCreateInvite(unique) {
    setInvites([
      ...invites,
      { id: 'new', code: '...', unique: !tournament.open },
    ])
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_DB_HOST}/invites`,
        {
          tournament: tournament.id,
          unique: tournament.open,
          expiration_date: new Date(),
          name: tournament.name,
        },
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      )
      setInvites([...invites, { id: res.data.id, code: res.data.code, unique }])
    } catch (error) {
      console.log(error)
      setInvites(invites.filter((invite) => invite.id !== 'new'))
    }
  }

  async function handleCreateGame() {
    setGames([...games, { id: 'new' }])
    // try {
    // const res = await axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/games`, {
    //   tournament: tournament.id,
    // })
    // setGames([...games, res.data])
    // } catch (error) {
    //   console.log(error)
    // }
  }

  async function handleDeleteInvite(id: string) {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites/${id}`
    )
    setInvites(invites.filter((invite) => invite.id !== id))
  }

  async function handleTeamAccept(
    teamId: string,
    change: boolean
  ): Promise<void> {
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams/${teamId}`,
      {
        accepted: change,
      }
    )
    if (res) {
      const patchedTeam = res.data
      console.log(patchedTeam)
      setTeams(
        teams
          .map((team) => {
            return team.id === patchedTeam.id ? patchedTeam : team
          })
          .sort((a, b) => compareAsc(a.start_date, b.start_date))
      )
    }
  }

  async function handleTeamAdd(event, gameId: string): Promise<void> {
    // event.preventDefault()
    // const update = {
    //   teams: [event.target.team1.value, event.target.team2.value],
    // }
    // try {
    //   const res = await axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/games`, {
    //     tournament: tournament.id,
    //     teams: [event.target.team1.value, event.target.team2.value],
    //   })
    //   setGames([...games, res.data])
    // } catch (error) {
    //   console.log(error)
    // }
    // const res = await axios.patch(
    //   `${process.env.NEXT_PUBLIC_DB_HOST}/games/${gameId}`,
    //   update
    // )
    // if (res) {
    //   const patchedTeam = res.data
    //   console.log(patchedTeam)
    //   setTeams(
    //     teams.map((team) => {
    //       return team.id === patchedTeam.id ? patchedTeam : team
    //     })
    //   )
    // }
  }
  const addTeam =
    (tournamentId: string) =>
    async ({
      startDate,
      teamIds,
    }: {
      startDate: Date
      teamIds: string[]
    }): Promise<void> => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/games`,
          {
            tournament: tournamentId,
            teams: teamIds,
            start_date: startDate,
          }
        )
        // console.log({ ...res.data, teams })
        const addedTeams = teamIds.map((id) =>
          teams.find((team) => team.id === id)
        )

        console.log(addedTeams)
        setGames(
          [...games, { ...res.data, teams: addedTeams }].sort((a, b) =>
            compareAsc(new Date(a.start_date), new Date(b.start_date))
          )
        )
      } catch (error) {
        console.log(error)
      }
    }

  return (
    <section>
      <Link href={`/tournaments/${tournament.id}/admin`}>Admin</Link>
      <h1>{tournament.name}</h1>
      <button onClick={() => handleCreateVenue(true)}>Skapa inbjudan</button>
      <div>
        <Link href={`${tournament.id}/edit`}>Ändra</Link>
      </div>
      <h2>{tournament.open ? 'Öppen tävling' : 'Endast inbjudan'}</h2>
      <button onClick={() => handleCreateInvite(true)}>Skapa inbjudan</button>
      {invites.length ? (
        <ul>
          {invites.map((invitation) => (
            <li key={invitation.id}>
              <Link href={`/invite/${invitation.code}`}>{invitation.code}</Link>{' '}
              - <b>{invitation.unique ? 'Inte använd' : 'Öppen inbjudan'}</b>
              {' - '}
              {session && (
                <button onClick={() => handleDeleteInvite(invitation.id)}>
                  Ta bort
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>...</p>
      )}
      {teams.length ? (
        <ul>
          {teams.map((team) => (
            <li key={team.id}>
              <Link href={`/team/${team.team_code}`}>
                {team.name} {team.accepted ? 'Antagen' : 'Nekad'}
              </Link>
              {team.accepted ? (
                <button onClick={() => handleTeamAccept(team.id, false)}>
                  Neka
                </button>
              ) : (
                <button onClick={() => handleTeamAccept(team.id, true)}>
                  Anta
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Inga anmälda lag</p>
      )}
      <section>
        <GameCreator teams={teams} addTeam={addTeam(tournament.id)} />
      </section>
      <section>
        {games.length ? (
          <ul>
            {games.map((game, i) => (
              <li key={game.id}>
                <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
                <GameBox game={game} />
              </li>
            ))}
          </ul>
        ) : (
          <p>Inga matcher</p>
        )}
        <button onClick={() => handleCreateGame()}>Skapa Match</button>
      </section>
    </section>
  )
}
