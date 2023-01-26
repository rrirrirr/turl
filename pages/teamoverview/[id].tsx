import axios from 'axios'
import { GetStaticPropsContext } from 'next'
import { Box, Center, Container, Flex, Stack } from '@mantine/core'
import { useStyles } from '../../styles/styles'

export async function getStaticPaths() {
  const teamsRes = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/teams`, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
    },
  })
  const teams = teamsRes.data as Team[]

  const paths = teams.map((team) => ({
    params: { id: team.id },
  }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(
  context: GetStaticPropsContext<{
    id: string
  }>
) {
  const id = context.params?.id

  try {
    const teamRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/teams/${id}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )
    const team = teamRes.data

    return {
      props: {
        team: team,
        players: team.player || [],
      },
      revalidate: 10,
    }
  } catch (error) {
    console.log(error)
    return { props: { team: null, players: [] }, revalidate: 10 }
  }
}

interface Props {
  team: Team
  players: Player[]
}

export default function Team({ team, players }: Props) {
  const { classes } = useStyles()

  if (!team) {
    return <div>Inget här</div>
  }

  return (
    <Container>
      <Flex
        mih={50}
        gap="1rem"
        justify="flex-start"
        align="flex-start"
        direction="column"
      >
        <h1>{team.name}</h1>
        <Box className={classes.container} p="0">
          {players.length ? (
            <>
              <Box className={classes.titleBox}>
                <h4>Spelare</h4>
              </Box>
              {players.map((player) => (
                <Box key={player.id} p="0.1rem" m="0.5rem">
                  {player.first_name} {player.last_name}
                </Box>
              ))}
            </>
          ) : (
            <p>Inga spelare</p>
          )}
        </Box>
      </Flex>
    </Container>
  )
}
