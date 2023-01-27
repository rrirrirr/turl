import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { format } from 'date-fns'
import GameBox from '../../components/gameBox'
import { GetServerSidePropsContext } from 'next'
import { User } from '../../types/user'
import { Center, Accordion, List, Box, Container, Stack } from '@mantine/core'
import { useStyles } from '../../styles/styles'
import GamesList from '../../components/gamesList'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    code: string
  }>
) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  if (!session) {
    return {
      props: {
        user: null,
        tournaments: null,
        teams: null,
        games: null,
      },
    }
  }

  try {
    const userRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/users/${session.user.username}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )

    const user = userRes.data as User
    const teams = user?.teams || []

    const tournaments = teams.length ? teams.map((team) => team.tournament) : []
    // const games = teams.games
    const games = teams.length ? teams.map((team) => team.games || []) : []

    return {
      props: {
        user: user,
        tournaments: tournaments,
        teams: teams,
        games: games,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        user: null,
        tournaments: null,
        teams: null,
        games: null,
      },
    }
  }
}

type TeamWithPopulatedTournament = Omit<Team, 'tournament'> & {
  tournament: Tournament
}

type GameWithPopulatedTournament = Omit<Game, 'tournament'> & {
  tournament: Tournament
}

interface Props {
  user: User
  tournaments: Tournament[]
  teams: TeamWithPopulatedTournament[]
  games: GameWithPopulatedTournament[][]
}

export default function Tournaments({
  user,
  tournaments,
  teams,
  games,
}: Props) {
  const { classes } = useStyles()
  const teamMap = tournaments.reduce((acc, tournament) => {
    return {
      ...acc,
      [tournament.id]: teams.find(
        (team) => team.tournament.id === tournament.id
      ),
    }
  }, {})
  if (!user) {
    return <p>Inget här</p>
  }

  return (
    <Container>
      <section>
        <Stack>
          <Container className={classes.titleBox}>
            <h1>{user.first_name}</h1>
          </Container>
          <Center>
            <h2>Dina Tävlingar</h2>
          </Center>
          {tournaments.length ? (
            tournaments.map((tournament, i) => (
              <Box key={tournament.id} className={classes.container} p="0">
                <Box
                  className={classes.titleBox}
                  component={Link}
                  href={`/tournaments/${tournament.id}`}
                  m="0"
                >
                  <h3>{tournament.name} </h3>
                </Box>
                <b>
                  Lag{' '}
                  <Link href={`/team/${teamMap[tournament.id].team_code}`}>
                    {teamMap[tournament.id].name || 'lag'}
                  </Link>
                </b>
                <h4>Matcher</h4>
                <Container>
                  {games[i].length ? <GamesList games={games[i]} /> : '...'}
                </Container>
              </Box>
            ))
          ) : (
            <b>Inga tävlingar</b>
          )}
        </Stack>
      </section>
    </Container>
  )
}
