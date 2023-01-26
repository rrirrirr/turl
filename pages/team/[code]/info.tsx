import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { GetStaticPropsContext } from 'next'
import { Box, Button, Center, Group, Stack } from '@mantine/core'

export async function getStaticPaths() {
  const teamsRes = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/teams`, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
    },
  })
  const teams = teamsRes.data as Team[]

  const paths = teams.map((team) => ({
    params: { code: team.team_code },
  }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(
  context: GetStaticPropsContext<{
    code: string
  }>
) {
  const code = context?.params?.code
  const teamRes = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/teams?team_code=${code}`,
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
      },
    }
  )
  const team = teamRes.data

  return {
    props: { team: team },
    revalidate: 10,
  }
}

interface Props {
  team: Team
}
export default function Info({ team }: Props) {
  const router = useRouter()

  if (!team) {
    return <>Hittade inget</>
  }

  return (
    <Center>
      <Stack spacing="xs">
        <Center>
          <h2>Spelare</h2>
        </Center>
        <Center>
          {team?.player?.length ? (
            <ul>
              {team.player.map((player) => (
                <li key={player.id}>
                  <p>
                    {player.first_name} {player.last_name}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            'Inga spelare'
          )}
        </Center>
        <Center>
          <Group>
            <Button
              component={Link}
              href={`/team/${team.team_code}`}
              className={styles.navLink}
            >
              Överblick
            </Button>
            <Button
              component={Link}
              href={`/team/${team.team_code}/games`}
              className={styles.navLink}
            >
              Matcher
            </Button>
          </Group>
        </Center>
      </Stack>
    </Center>
  )
}
