import { Box, Center, Container } from '@mantine/core'
import Link from 'next/link'
import GameBox from './gameBox'
import { useStyles } from '../styles/styles'

export default function GamesList({ games }: { games: Game[] }) {
  const { classes } = useStyles()

  return (
    <Container>
      {games.length ? (
        <Box>
          {games.map((game, i) => (
            <Box key={game.id} className={classes.titleBox}>
              <h4>
                <Link href={`/game/${game.id}`}>
                  {game?.name || `Match: ${i + 1}`}
                </Link>
              </h4>
              <Center>
                <GameBox game={game} />
              </Center>
            </Box>
          ))}
        </Box>
      ) : (
        <p>Inga matcher</p>
      )}
    </Container>
  )
}
