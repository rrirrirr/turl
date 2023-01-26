import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { createScoreObject } from '../utils/utils'
import { format } from 'date-fns'
import { Box, Button, Center, Container, Flex, Group } from '@mantine/core'
import { useStyles } from '../styles/styles'

export default function GameBoxAdmin(props: {
  game: Game
  deleteGame: () => Promise<void>
}) {
  const { classes } = useStyles()
  const deleteGame = props.deleteGame
  const [game, setGame] = useState(props.game)
  const [result, setResult] = useState<Result>(
    typeof game.result === 'string'
      ? JSON.parse(game.result)
      : createScoreObject(game?.teams || [])
  )
  const [update, setUpdate] = useState(false)
  const [active, setActive] = useState(game.active)

  async function updateResult(gameId: string, result: Result): Promise<void> {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/games/${gameId}`,
        {
          result: JSON.stringify(result),
        }
      )
      setUpdate(false)
      setResult(result)
    } catch (error) {
      console.log(error)
    }
  }

  async function changeActiveStatus(
    gameId: string,
    change: boolean
  ): Promise<void> {
    try {
      const update = change
        ? {
            active: change,
          }
        : { active: change, end_date: new Date() }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/games/${gameId}`,
        update
      )
      setActive(change)
      setGame({ ...game, end_date: res.data.end_date })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Center>
      <Flex direction="column" gap="0.5rem">
        <Group p="0" m="0">
          <p>{game.active ? 'Pågående' : game.end_date ? 'Avslutad' : ''}</p>
          <span> {format(new Date(game.start_date), 'yyyy-MM-dd HH:mm')}</span>

          <b>{game.name || ''}</b>
        </Group>
        <Flex
          bg="rgba(0, 0, 0, .3)"
          gap="0rem"
          justify="flex-start"
          align="flex-start"
          direction="row"
        >
          {game.teams?.length
            ? game.teams.map((team, i) => (
                <Flex
                  mih={50}
                  key={team.id}
                  bg="rgba(0, 0, 0, .3)"
                  gap="0"
                  justify="flex-start"
                  align="flex-start"
                  direction="column"
                >
                  <Button
                    className={classes.gameRow}
                    color="indigo"
                    radius="xs"
                    onClick={() => {
                      if (!active) {
                        return
                      }
                      setUpdate(true)
                      setResult({
                        ...result,
                        [team.name]: { score: result[team.name].score + 1 },
                      })
                    }}
                  >
                    {result[team.name].score}
                  </Button>
                  <Box
                    className={classes.gameRow}
                    component={Link}
                    href={`/teamoverview/${team.id}`}
                  >
                    {team.name}
                  </Box>
                </Flex>
              ))
            : 'Inga lag'}
        </Flex>
        <Container>
          <Group>
            {update && (
              <Button onClick={() => updateResult(game.id, result)}>
                Uppdatera
              </Button>
            )}
            {active ? (
              <Button onClick={() => changeActiveStatus(game.id, false)}>
                Avsluta match
              </Button>
            ) : game.end_date ? (
              <Button onClick={() => changeActiveStatus(game.id, true)}>
                Återuppta match
              </Button>
            ) : (
              <Button onClick={() => changeActiveStatus(game.id, true)}>
                Starta match
              </Button>
            )}
            <Button onClick={() => deleteGame()}>Ta bort</Button>
          </Group>
        </Container>
      </Flex>
    </Center>
  )
}
