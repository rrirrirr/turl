import { Box, Center, Container, Group } from '@mantine/core'
import Link from 'next/link'

export function TeamsList({
  teams,
  handleTeamAccept,
}: {
  teams: Team[]
  handleTeamAccept: (id: string, app: Application) => any
}) {
  return (
    <Center>
      {teams.length ? (
        <Box>
          {teams.map((team) => (
            <Group spacing="sm" key={team.id}>
              {team.accepted === 'accepted' ? (
                <button onClick={() => handleTeamAccept(team.id, 'declined')}>
                  Neka
                </button>
              ) : team.accepted === 'waiting' ? (
                <Group spacing="sm">
                  <button onClick={() => handleTeamAccept(team.id, 'accepted')}>
                    Anta
                  </button>
                  <button onClick={() => handleTeamAccept(team.id, 'declined')}>
                    Neka
                  </button>
                </Group>
              ) : (
                <button onClick={() => handleTeamAccept(team.id, 'accepted')}>
                  Anta
                </button>
              )}
              <Link href={`/teamoverview/${team.id}`}>{team.name}</Link>
            </Group>
          ))}
        </Box>
      ) : (
        <p>...</p>
      )}
    </Center>
  )
}
