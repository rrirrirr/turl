import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GameCreator } from '../../components/gameCreator'
import { compareAsc, format } from 'date-fns'
import GameBoxAdmin from '../../components/gameBoxAdmin'
import GameBox from '../../components/gameBox'
import { TeamsList } from '../../components/teamsList'
import GamesList from '../../components/gamesList'
import { GetStaticPropsContext } from 'next'
import { Header } from '../../components/header'
import { Button, Collapse, Container } from '@mantine/core'

export async function getStaticPaths() {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`)
  const tournaments = res.data as Tournament[]

  const paths = tournaments.map((tournament) => ({
    params: { id: tournament.id },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps(
  context: GetStaticPropsContext<{
    id: string
  }>
) {
  const id = context.params?.id
  try {
    const tournamentRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${id}`
    )
    const tournament = tournamentRes.data as Tournament
    const teams = tournament?.teams?.filter((team) => team.accepted) || []
    const games = tournament?.games || []

    const sortedGames =
      games?.sort((a, b) =>
        compareAsc(new Date(a.start_date), new Date(b.start_date))
      ) || []

    const sortedGamesWithParsedResults = sortedGames.map((game) => {
      return { ...game, result: JSON.parse(game.result as string) }
    })

    return {
      props: {
        tournament: tournament,
        teams: teams,
        games: sortedGamesWithParsedResults,
        // games_: games.data,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        tournament: null,
        teams_: null,
        games_: null,
      },
    }
  }
}

interface Props {
  tournament: Tournament
  teams: Team[]
  games: Game[]
}

export default function Tournaments({ tournament, teams, games }: Props) {
  if (!tournament) {
    return <p>Inget här</p>
  }

  const [showActiveGames, setShowActiveGames] = useState<boolean>(false)
  const [showPlayedGames, setShowPlayedGames] = useState<boolean>(false)
  const [showUpcomingGames, setShowUpcomingGames] = useState<boolean>(false)

  const activeGames = games.filter((game) => game.active)
  const playedGames = games.filter((game) => game.end_date)
  const upcomingGames = games.filter((game) => !game.active && !game.end_date)
  const { data: session, status } = useSession()

  return (
    <Container>
      <section>
        <Button component={Link} href={`${tournament.id}/table`}>
          Se tabell
        </Button>
        <h1>{tournament.name}</h1>
        {tournament.venue && <p>I {tournament.venue}</p>}
        <ul>
          <li>{tournament.open ? 'Öppen tävling' : 'Invitational'}</li>
          <li>
            {tournament.start_date
              ? format(new Date(tournament.start_date), 'yyyy-MM-dd')
              : 'Inget startdatum'}
            {' - '}
            {tournament.end_date
              ? format(new Date(tournament.end_date), 'yyyy-MM-dd')
              : 'Inget slutdatum'}
          </li>
          <li>{tournament.format}</li>
          <li>
            {tournament.max_num_teams
              ? `Max ${tournament.max_num_teams} lag`
              : 'Obegränsat med lag'}
          </li>
          <li>
            {tournament.min_num_players_in_team
              ? `Minst ${tournament.min_num_players_in_team} per lag`
              : 'Obegränsat antal spelare i lag'}
          </li>
        </ul>
      </section>
      {tournament.description && <section>{tournament.description}</section>}
      <section>
        <h2>Lag</h2>
        {teams.length ? (
          <ul>
            {teams.map((team, i) => (
              <li key={team.id}>
                <Link href={`/teamoverview/${team.id}`}>{team.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Inga matcher</p>
        )}
      </section>

      <Button
        m="1rem"
        onClick={() => {
          setShowActiveGames((o: boolean) => !o)
          setShowUpcomingGames(() => false)
          setShowPlayedGames(() => false)
        }}
      >
        Visa pågående matcher
      </Button>

      <Button
        m="1rem"
        onClick={() => {
          setShowUpcomingGames((o: boolean) => !o)
          setShowActiveGames(() => false)
          setShowPlayedGames(() => false)
        }}
      >
        Visa kommande matcher
      </Button>

      <Button
        m="1rem"
        onClick={() => {
          setShowPlayedGames((o: boolean) => !o)
          setShowUpcomingGames(() => false)
          setShowActiveGames(() => false)
        }}
      >
        Visa spelade matcher
      </Button>

      <Collapse in={showActiveGames}>
        <GamesList games={activeGames} />
      </Collapse>

      <Collapse in={showPlayedGames}>
        <GamesList games={playedGames} />
      </Collapse>

      <Collapse in={showUpcomingGames}>
        <GamesList games={upcomingGames} />
      </Collapse>
    </Container>
  )
}
