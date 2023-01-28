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
import { generateRoundRobinSchedule, sortGames } from '../../../utils/utils'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { GetServerSidePropsContext } from 'next'
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Button,
  Container,
  Box,
  Stack,
  Group,
  Code,
  NumberInput,
  Center,
  BackgroundImage,
  Flex,
} from '@mantine/core'
import { useStyles } from '../../../styles/styles'
import { groupEnd } from 'console'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    id: string
  }>
) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )

  const tournamentId = context.params?.id

  try {
    const tournamentRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournamentId}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )

    const tournament = tournamentRes.data as Tournament
    const invites = tournament.invites
    const games = tournament.games
    const teams = tournament.teams
    const sortedGames = tournament.games?.length
      ? sortGames(tournament.games, 'DESC')
      : []

    const isAdmin = tournament.tournamentAdmins.find((admin) => {
      return admin.user === session?.user.userId
    })

    if (!isAdmin && !session.user.isAdmin) {
      throw new Error('No permission')
    }

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

interface Props {
  tournament: Tournament
  invites_: Invite[]
  teams_: Team[]
  games_: Game[]
}

export default function Admin({ tournament, invites_, teams_, games_ }: Props) {
  const { data: session, status } = useSession()
  const theme = useMantineTheme()
  const [opened, setOpened] = useState(false)
  const { classes } = useStyles()
  const [invites, setInvites] = useState<Invite[]>(invites_)
  const [teams, setTeams] = useState<Team[]>(teams_)
  const [acceptedTeams, setAcceptedTeams] = useState<Team[]>([])
  const [declinedTeams, setDeclinedTeams] = useState<Team[]>([])
  const [waitingTeams, setWaitingTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>(games_)

  const [showGames, setShowGames] = useState<boolean>(false)
  const [showInvites, setShowInvites] = useState<boolean>(false)
  const [showAcceptedTeams, setShowAcceptedTeams] = useState<boolean>(false)
  const [showDeclinedTeams, setShowDeclinedTeams] = useState<boolean>(false)
  const [showWaitingTeams, setShowWaitingTeams] = useState<boolean>(false)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [showScheduler, setShowScheduler] = useState<boolean>(false)
  const [groupingsSize, setGroupingsSize] = useState<number>(2)

  useEffect(() => {
    if (teams?.length) {
      setAcceptedTeams(teams.filter((team) => team.accepted === 'accepted'))
      setDeclinedTeams(teams.filter((team) => team.accepted === 'declined'))
      setWaitingTeams(teams.filter((team) => team.accepted === 'waiting'))
    }
  }, [teams])

  const createInvite =
    (unique: boolean) =>
    async (expiration: Date | null = null) => {
      setInvites([
        ...invites,
        {
          id: 'new',
          code: '...',
          unique: !tournament.open,
          expiration_date: expiration || new Date(),
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
          },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
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

  const deleteGame = (id: string) => async () => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_DB_HOST}/games/${id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      )
      setGames(games.filter((game) => game.id !== id))
    } catch (error) {
      console.log(error)
    }
  }

  async function deleteInvite(id: string) {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites/${id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
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
        },
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
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
          },
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          }
        )
        const addedTeams = teamIds.map((id) =>
          teams.find((team) => team.id === id)
        )

        setGames([{ ...res.data, teams: addedTeams }, ...games])
      } catch (error) {
        console.log(error)
      }
    }

  function updateSchedule(date: Date, i: number): void {
    setSchedule(
      schedule?.map((group, j) => {
        return i === j ? { ...group, startDate: date } : group
      }) || []
    )
  }

  async function addSchedule(): Promise<void> {
    try {
      const flatGames =
        schedule?.flatMap((group) =>
          group.games.map((game) => {
            return {
              tournament: tournament.id,
              teams: game,
              start_date: group.startDate,
              id: '' + Math.random().toString(16).slice(2),
              active: false,
              game_type: tournament.game_type,
            }
          })
        ) || ([] as Game[])

      const reqs = flatGames.map((game) => {
        return axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/games`, {
          tournament: tournament.id,
          teams: game.teams ? game.teams.map((team) => team.id) : [],
          start_date: game.start_date,
        })
      })
      Promise.all(reqs).then((res) => {
        const gamesToAdd = res.map((r) => r.data)
        setGames([...flatGames, ...games])
        setShowGames(true)
        setShowScheduler(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AppShell
      padding="md"
      navbarOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Navbar.Section>
            <Link href={`/tournaments/${tournament.id}`}>
              {tournament.name}
            </Link>
          </Navbar.Section>
          <Navbar.Section grow mt="md">
            <Button
              m="1rem"
              component={Link}
              color="pink"
              href={`/tournaments/${tournament.id}/edit`}
            >
              Ändra turnering
            </Button>

            <Button
              m="1rem"
              color={showAcceptedTeams ? 'green' : 'blue'}
              onClick={() => setShowAcceptedTeams(!showAcceptedTeams)}
            >
              Visa accepterade lag
            </Button>
            <Button
              m="1rem"
              color={showWaitingTeams ? 'green' : 'blue'}
              onClick={() => setShowWaitingTeams(!showWaitingTeams)}
            >
              Visa väntande lag
            </Button>
            <Button
              m="1rem"
              color={showDeclinedTeams ? 'green' : 'blue'}
              onClick={() => setShowDeclinedTeams(!showDeclinedTeams)}
            >
              Visa nekade lag
            </Button>
            <Button
              m="1rem"
              color={showInvites ? 'green' : 'blue'}
              onClick={() => setShowInvites(!showInvites)}
            >
              Visa inbjudningar
            </Button>
            <Button
              m="1rem"
              color={showGames ? 'green' : 'blue'}
              onClick={() => setShowGames(!showGames)}
            >
              Visa matcher
            </Button>
            <Button
              m="1rem"
              color={showScheduler ? 'green' : 'blue'}
              onClick={() => setShowScheduler(!showScheduler)}
            >
              Visa spelschemagenererare
            </Button>
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {showAcceptedTeams && (
        <section>
          <Box my="sm" className={classes.titleBox}>
            Accepterade lag
          </Box>
          <TeamsList
            teams={acceptedTeams}
            handleTeamAccept={handleTeamAccept}
          />
        </section>
      )}

      {showWaitingTeams && (
        <section>
          <Box my="sm" className={classes.titleBox}>
            Väntande lag
          </Box>
          <TeamsList teams={waitingTeams} handleTeamAccept={handleTeamAccept} />
        </section>
      )}

      {showDeclinedTeams && (
        <section>
          <Box my="sm" className={classes.titleBox}>
            Nekade lag
          </Box>
          <TeamsList
            teams={declinedTeams}
            handleTeamAccept={handleTeamAccept}
          />
        </section>
      )}

      {/*INVITES*/}
      {showInvites && (
        <section>
          <Box className={classes.titleBox} my="sm">
            Inbjudningar -{' '}
            {tournament.open ? 'Öppen tävling' : 'Endast inbjudan'}
          </Box>
          <Box className={classes.titleBox} my="sm">
            {!tournament.open ? (
              <InviteCreator creator={createInvite(false)} />
            ) : invites.length ? (
              ''
            ) : (
              <InviteCreator creator={createInvite(true)} />
            )}
          </Box>
          {invites.length ? (
            <Stack>
              {invites.map((invitation) => (
                <Box className={classes.titleBox} key={invitation.id}>
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
                      ? 'Förbrukad'
                      : invitation.unique
                      ? 'Inte använd'
                      : 'Öppen inbjudan'}
                  </b>
                  {' - '}
                  {session && (
                    <Button onClick={() => deleteInvite(invitation.id)}>
                      Ta bort
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <p>...</p>
          )}
        </section>
      )}

      {/*GAMES*/}
      {showGames && (
        <section>
          <Box className={classes.titleBox}>Matcher</Box>
          <Box className={classes.titleBox} my="sm">
            <GameCreator teams={teams} addTeam={addTeam(tournament.id)} />
          </Box>
          {games.length ? (
            <Stack>
              {games.map((game, i) => (
                <Box key={game.id} className={classes.titleBox}>
                  <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
                  <GameBoxAdmin game={game} deleteGame={deleteGame(game.id)} />
                </Box>
              ))}
            </Stack>
          ) : (
            <p>Inga matcher</p>
          )}
        </section>
      )}

      {/*SCHEDULER*/}
      {showScheduler && (
        <section>
          <Box className={classes.titleBox} mb="sm">
            Schema
          </Box>

          {schedule ? (
            <>
              <Stack>
                {schedule.map((group, i) => (
                  <Box
                    className={classes.titleBox}
                    key={`${group.startDate}${i}`}
                  >
                    <h3>Runda {i + 1}</h3>
                    <DatePicker
                      selected={group.startDate}
                      onChange={(date: Date) => updateSchedule(date, i)}
                      showTimeSelect
                      dateFormat="Pp"
                    />
                    {group.games.map((game) => (
                      <Box
                        className={classes.titleBox}
                        key={`${game[0].id}+${game[1].id}`}
                      >
                        {game.map((team, i) => (
                          <span key={team.id}>
                            {team.name}
                            {i < game.length - 1 && ' vs '}
                          </span>
                        ))}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Stack>
              <Group>
                <Button onClick={() => addSchedule()}>Spara Schema</Button>
                <Button onClick={() => setSchedule(null)}>Rensa Schema</Button>
              </Group>
            </>
          ) : (
            <Center>
              <Flex direction="column" gap="xs">
                <NumberInput
                  defaultValue={2}
                  label="Storlek på omgångar"
                  withAsterisk
                  required
                  onChange={(val) => setGroupingsSize(val || 1)}
                />
                <Button
                  onClick={() =>
                    setSchedule(
                      generateRoundRobinSchedule([...teams], groupingsSize)
                    )
                  }
                >
                  Generera schema
                </Button>
              </Flex>
            </Center>
          )}
        </section>
      )}
    </AppShell>
  )
}
