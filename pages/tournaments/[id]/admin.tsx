import axios from 'axios'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]'
import { GameCreator } from '../../../components/gameCreator'
import GameBoxAdmin from '../../../components/gameBoxAdmin'
import { compareAsc, format } from 'date-fns'
import { TeamsList } from '../../../components/teamsList'
import { InviteCreator } from '../../../components/inviteCreator'

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  const tournamentId = context.params.id

  if (!session.user.isAdmin) {
    return {
      props: {
        tournament: null,
        invites_: null,
        teams_: null,
        games_: null,
      },
    }
  }

  try {
    const tournamentRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournamentId}`
    )

    const tournament = tournamentRes.data
    const invites = tournament.invites
    const games = tournament.games
    const teams = tournament.teams
    const sortedGames = tournament.games.sort((a, b) =>
      compareAsc(new Date(a.start_date), new Date(b.start_date))
    )

    return {
      props: {
        tournament: tournament,
        invites_: invites,
        teams_: teams,
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
type TournamentInfo = {
  tournament: Tournament
  invites_: Invite[]
  teams_: Team[]
  games_: Game[]
}

export default function Admin({ tournament, invites_, teams_, games_ }) {
  if (!tournament) {
    return <p>Inget här</p>
  }
  const [invites, setInvites] = useState(invites_)
  const [teams, setTeams] = useState(teams_)
  const [acceptedTeams, setAcceptedTeams] = useState([])
  const [declinedTeams, setDeclinedTeams] = useState([])
  const [waitingTeams, setWaitingTeams] = useState([])

  const [games, setGames] = useState(games_)
  const { data: session, status } = useSession()

  const [showGames, setShowGames] = useState(false)
  const [showInvites, setShowInvites] = useState(false)
  const [showAcceptedTeams, setShowAcceptedTeams] = useState(false)
  const [showDeclinedTeams, setShowDeclinedTeams] = useState(false)
  const [showWaitingTeams, setShowWaitingTeams] = useState(false)

  useEffect(() => {
    setAcceptedTeams(teams.filter((team) => team.accepted === 'accepted'))
    setDeclinedTeams(teams.filter((team) => team.accepted === 'declined'))
    setWaitingTeams(teams.filter((team) => team.accepted === 'waiting'))
  }, [teams])

  const createInvite =
    (unique: boolean) =>
    async (expiration: Date | null = null) => {
      console.log('invite')
      console.log(expiration)
      setInvites([
        ...invites,
        {
          id: 'new',
          code: '...',
          unique: !tournament.open,
          expiration_date: expiration,
        },
      ])
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/invites`,
          {
            tournament: tournament.id,
            unique: !tournament.open,
            expiration_date: expiration,
            name: tournament.name,
          }
        )
        setInvites([
          ...invites,
          {
            id: res.data.id,
            code: res.data.code,
            unique: res.data.unique,
            expiration_date: res.data.expiration_date,
          },
        ])
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

  async function deleteInvite(id: string) {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites/${id}`
    )
    setInvites(invites.filter((invite) => invite.id !== id))
  }

  async function handleTeamAccept(
    teamId: string,
    change: Application
  ): Promise<void> {
    try {
      const teamRes = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/teams/${teamId}`,
        {
          accepted: change,
        }
      )
      const patchedTeam = teamRes.data
      setTeams(
        teams.map((team) => {
          return team.id === patchedTeam.id ? patchedTeam : team
        })
      )
    } catch (error) {
      console.log(error)
    }
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
      <>
        <h1>{tournament.name}</h1>

        {showAcceptedTeams ? (
          <>
            <button onClick={() => setShowAcceptedTeams(false)}>
              Göm accpeterade Lag
            </button>
            <section>
              <TeamsList
                teams={acceptedTeams}
                handleTeamAccept={handleTeamAccept}
              />
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowAcceptedTeams(true)}>
              Visa accepterade Lag
            </button>
          </>
        )}

        {showWaitingTeams ? (
          <>
            <button onClick={() => setShowWaitingTeams(false)}>
              Göm ansökande Lag
            </button>
            <section>
              <TeamsList
                teams={waitingTeams}
                handleTeamAccept={handleTeamAccept}
              />
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowWaitingTeams(true)}>
              Visa ansökande Lag
            </button>
          </>
        )}

        {showDeclinedTeams ? (
          <>
            <button onClick={() => setShowDeclinedTeams(false)}>
              Göm nekade Lag
            </button>
            <section>
              <TeamsList
                teams={declinedTeams}
                handleTeamAccept={handleTeamAccept}
              />
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowDeclinedTeams(true)}>
              Visa nekade Lag
            </button>
          </>
        )}

        {showInvites ? (
          <>
            <button onClick={() => setShowInvites(false)}>
              Göm Inbjudningar
            </button>
            <section>
              <div>
                <Link href={`${tournament.id}/edit`}>Ändra</Link>
              </div>
              <h2>{tournament.open ? 'Öppen tävling' : 'Endast inbjudan'}</h2>
              {!tournament.open ? (
                <InviteCreator creator={createInvite(false)} />
              ) : invites.length ? (
                ''
              ) : (
                <InviteCreator creator={createInvite(true)} />
              )}
              {invites.length ? (
                <ul>
                  {invites.map((invitation) => (
                    <li key={invitation.id}>
                      {new Date(invitation.expiration_date) < new Date() ? (
                        <p>
                          Gick ut{' '}
                          {format(
                            new Date(invitation.expiration_date),
                            'yyyy-MM-dd HH:mm'
                          )}
                        </p>
                      ) : (
                        <b>
                          Går ut:
                          {format(
                            new Date(invitation.expiration_date),
                            'yyyy-MM-dd HH:mm'
                          )}
                        </b>
                      )}
                      <Link href={`/invite/${invitation.code}`}>
                        {invitation.code}
                      </Link>{' '}
                      -{' '}
                      <b>
                        {invitation.used
                          ? 'Förbrukad inbjudan'
                          : invitation.unique
                          ? 'Inte använd'
                          : 'Öppen inbjudan'}
                      </b>
                      {' - '}
                      {session && (
                        <button
                          onClick={() => handleDeleteInvite(invitation.id)}
                        >
                          Ta bort
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>...</p>
              )}
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowInvites(true)}>
              Visa Inbjudningar
            </button>
          </>
        )}

        {showGames ? (
          <>
            <button onClick={() => setShowGames(false)}>Göm Matcher</button>
            <div>
              <GameCreator teams={teams} addTeam={addTeam(tournament.id)} />
            </div>
            <section>
              {games.length ? (
                <ul>
                  {games.map((game, i) => (
                    <li key={game.id}>
                      <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
                      <GameBoxAdmin game={game} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Inga matcher</p>
              )}
              <button onClick={() => handleCreateGame()}>Skapa Match</button>
            </section>
          </>
        ) : (
          <>
            <button onClick={() => setShowGames(true)}>Visa Matcher</button>
          </>
        )}
      </>
    </section>
  )
}
