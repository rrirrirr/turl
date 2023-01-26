import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import { User } from '../../types/user'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Stack,
  TextInput,
} from '@mantine/core'
import { ButtonGroup } from '@mantine/core/lib/Button/ButtonGroup/ButtonGroup'
import { useStyles } from '../../styles/styles'

// export async function getStaticPaths() {
//   const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/invitations`)
//   const invites = res.data

//   const paths = invites.map((invite) => ({
//     params: { code: invite.code },
//   }))
//   return { paths, fallback: 'blocking' }
// }

// export async function getStaticProps({ params }) {
//   const res = await axios.get(
//     `${process.env.NEXT_PUBLIC_DB_HOST}/invitations/${params.code}`
//   )
//   return { props: { data: res.data },       revalidate: 10 }
// }

type TeamUser = User & { inTeam: boolean }

//Temporary
export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    code: string
  }>
) {
  const code = context?.params?.code

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  let user = null

  if (session) {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users/${session.user.username}`, //populate
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
          },
        }
      )
      user = userRes.data as User
    } catch (error) {
      console.log(error)
    }
  }

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${code}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )

    const team = res.data as Team

    if (user) {
      user.inTeam = user.teams.find((team): boolean => team.team_code === code)
        ? true
        : false
    }

    return {
      props: {
        currentUser: user,
        team: team,
        // tournament: null,
        tournament: team.tournament,
        players_: team.player,
      },
    }
  } catch (error) {
    console.log(error)
  }
  return { props: { team: null, tournament: null, players: [] } }
}

interface Props {
  currentUser: TeamUser
  team: Team
  tournament: Tournament
  players_: Player[]
}
export default function Team({
  currentUser,
  team,
  tournament,
  players_,
}: Props) {
  const router = useRouter()
  const [players, setPlayers] = useState(players_)
  const [user, setUser] = useState(currentUser)
  const { classes } = useStyles()

  if (!team) {
    return <>Hittade inget</>
  }

  async function handleJoin(event: any): Promise<void> {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/users/${user.id}`,
        {
          team: team.id,
        }
      )
      setUser({ ...user, inTeam: true })
    } catch (error) {
      console.log(error)
    }
  }

  async function handlePlayerAdd(event: any): Promise<void> {
    event.preventDefault()
    try {
      const playerRes = await axios.post(
        `${process.env.NEXT_PUBLIC_DB_HOST}/player`,
        {
          first_name: event.target.firstName.value,
          last_name: event.target.lastName.value,
          team: team.id,
        }
      )

      const newPlayer = playerRes.data as Player
      setPlayers([...players, newPlayer])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container>
      <Box className={classes.container} p="0">
        <Box className={classes.titleBox}>
          {' '}
          <h1>TEAM {team.name}</h1>
        </Box>
        <Stack spacing="xs">
          {user && user.inTeam ? (
            <p>Ditt lag</p>
          ) : (
            <Button onClick={() => handleJoin(team.team_code)}>
              Gå med i lag
            </Button>
          )}
          <h2>
            {team.accepted === 'accepted'
              ? 'antagen'
              : team.accepted === 'declined'
              ? 'Nekad'
              : 'Väntar på svar'}
          </h2>
          <Link href={`/tournaments/${tournament.id}`}>
            <h3>turnering: {tournament.name}</h3>
          </Link>
          <Center>
            <Group>
              <Button
                component={Link}
                href={`${team.team_code}/info`}
                className={styles.navLink}
              >
                Info
              </Button>
              <Button
                component={Link}
                href={`${team.team_code}/games`}
                className={styles.navLink}
              >
                Matcher
              </Button>
            </Group>
          </Center>
          <Box className={classes.container} p="0">
            <Box className={classes.titleBox}>Spelare</Box>

            <Center>
              <Stack spacing="xs">
                {players.length ? (
                  players.map((player) => (
                    <Group m="0.1rem" key={player.id}>
                      <span>
                        {player.first_name} {player.last_name}
                      </span>
                    </Group>
                  ))
                ) : (
                  <Box>Inga spelare</Box>
                )}
              </Stack>
            </Center>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}
