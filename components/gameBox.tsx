import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createScoreObject } from '../utils/utils'
import { format } from 'date-fns'
import { Box, Group, Button, Flex } from '@mantine/core'
import { useStyles } from '../styles/styles'

export default function GameBox({ game }: { game: Game }) {
  const { classes } = useStyles()
  const result_ = (game?.result as Result) || null
  const [result, setResult] = useState<Result>(
    result_ || createScoreObject(game.teams)
  )
  const [update, setUpdate] = useState<boolean>(false)

  return (
    <Box>
      <div>
        <span> {format(new Date(game.start_date), 'yyyy-MM-dd HH:mm')}</span>
      </div>
      <b>{game.name || ''}</b>
      <section>
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
                  >
                    {result[team.name].score}
                  </Button>
                  <Box
                    className={classes.gameRow}
                    component={Link}
                    href={`/team/overview/${team.id}`}
                  >
                    {team.name}
                  </Box>
                </Flex>
              ))
            : 'Inga lag'}
        </Flex>
        {game.active ? 'Pågående' : game.end_date ? 'Avslutad' : ''}
      </section>
    </Box>
  )
}
