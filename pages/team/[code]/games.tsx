import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import GameBox from '../../../components/gameBox'
import { GetServerSidePropsContext } from 'next'
import { Box, Button, Center, Collapse, Group, Stack } from '@mantine/core'
import { useStyles } from '../../../styles/styles'
import GamesList from '../../../components/gamesList'
import { sortGames } from '../../../utils/utils'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    code: string
  }>
) {
  const code = context?.params?.code
  try {
    const teamRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${code}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )
    const team = teamRes.data
    const games = team?.games || []

    const sortedGames = sortGames(games, 'DESC')

    const sortedGamesWithParsedResults = sortedGames.map((game) => {
      return { ...game, result: JSON.parse(game.result as string) }
    })

    return {
      props: { team: team, games: sortedGamesWithParsedResults },
    }
  } catch (error) {
    console.log(error)
  }
  return { props: { team: null, tournament: null } }
}

interface Props {
  team: Team
  games: Game[]
}

export default function TeamGames({ team, games }: Props) {
  const { classes } = useStyles()
  const [showUpcomingGames, setShowUpcomingGames] = useState<boolean>(false)
  const [showPlayedGames, setShowPlayedGames] = useState<boolean>(false)

  if (!team) {
    return <>Hittade inget</>
  }

  const playedGames = games.filter((game) => game.end_date)
  const upcomingGames = games.filter((game) => !game.active && !game.end_date)

  return (
    <Center>
      <Box className={classes.container} p="0">
        <Box className={classes.titleBox}>
          <h1>TEAM {team.name}</h1>{' '}
        </Box>
        <Stack>
          <Center>
            <Button
              m="1rem"
              color={showUpcomingGames ? 'green' : 'blue'}
              onClick={() => {
                setShowUpcomingGames((o: boolean) => !o)
                setShowPlayedGames(() => false)
              }}
            >
              Visa kommande matcher
            </Button>

            <Button
              m="1rem"
              color={showPlayedGames ? 'green' : 'blue'}
              onClick={() => {
                setShowPlayedGames((o: boolean) => !o)
                setShowUpcomingGames(() => false)
              }}
            >
              Visa spelade matcher
            </Button>
          </Center>
          <Box>
            <Collapse in={showPlayedGames}>
              <GamesList games={playedGames} />
            </Collapse>

            <Collapse in={showUpcomingGames}>
              <GamesList games={upcomingGames} />
            </Collapse>
          </Box>
          <Center>
            <Group>
              <Button
                component={Link}
                href={`/team/${team.team_code}`}
                className={styles.navLink}
              >
                Överblick
              </Button>
            </Group>
          </Center>
        </Stack>
      </Box>
    </Center>
  )
}

// {showUpcomingGames ? (
//   <>
//     <button onClick={() => setShowUpcomingGames(false)}>
//       Göm kommande matcher
//     </button>
//     <section>
//       {upcomingGames.length ? (
//         <ul>
//           {upcomingGames.map((game, i) => (
//             <li key={game.id}>
//               <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
//               <GameBox game={game} />
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>Inga matcher</p>
//       )}
//     </section>
//   </>
// ) : (
//   <>
//     <button onClick={() => setShowUpcomingGames(true)}>
//       Visa kommande matcher
//     </button>
//   </>
// )}
// {showPlayedGames ? (
//   <>
//     <button onClick={() => setShowPlayedGames(false)}>
//       Göm spelade och pågående matcher
//     </button>
//     <section>
//       {playedGames.length ? (
//         <ul>
//           {playedGames.map((game, i) => (
//             <li key={game.id}>
//               <Link href={`/game/${game.id}`}>Match: {i + 1}</Link>
//               <GameBox game={game} />
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>Inga matcher</p>
//       )}
//     </section>
//   </>
// ) : (
//   <>
//     <button onClick={() => setShowPlayedGames(true)}>
//       Visa spelade matcher
//     </button>
//   </>
// )}
