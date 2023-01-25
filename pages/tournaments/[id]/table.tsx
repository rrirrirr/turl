import axios from 'axios'
import { useRouter } from 'next/router'
import styles from 'styles/Home.module.css'
import Link from 'next/link'
import { useState } from 'react'
import { unstable_getServerSession } from 'next-auth'
import {
  createRoundRobinTable,
  sortRoundRobinTable,
} from '../../../utils/utils'
import { GetServerSidePropsContext } from 'next'
import Tournaments from '../../user/[id]'
import { Button, Container, Table } from '@mantine/core'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    id: string
  }>
) {
  const id = context.params?.id

  try {
    const tournamentRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${id}` //populate
    )
    const tournament = tournamentRes.data as Tournament
    let games = tournament.games || []
    const teams = tournament.teams || []
    if (games.length) {
      games = games.filter((game) => !game.active && game.end_date)
    }
    games = games.map((game) => {
      return { ...game, result: JSON.parse(game.result as string) }
    })
    return {
      props: {
        tournament: tournament,
        teams: teams,
        games: games,
      },
    }
  } catch (error) {
    console.log(error)
    return { props: { teams: null, tournament: null, games: null } }
  }
}

interface Props {
  teams: Team[]
  tournament: Tournament
  games: Game[]
}
export default function Team({ teams, tournament, games }: Props) {
  const table = createRoundRobinTable(games, teams, {
    pointsForWin: 3,
    pointsForDraw: 1,
  })
  const sortedTable = sortRoundRobinTable(table)
  console.log(sortedTable)

  const rows = sortedTable.map((row) => (
    <tr key={row.name}>
      <td>{row.name}</td>
      <td>{row.info.points}</td>
      <td>{row.info.wins}</td>
      <td>{row.info.draws}</td>
      <td>{row.info.losses}</td>
      <td>{row.info.played}</td>
    </tr>
  ))

  return (
    <Container>
      <Button component={Link} href={`/tournaments/${tournament.id}`}>
        Se överblick
      </Button>

      <Container>
        <Table>
          <thead>
            <tr>
              <th>Lag</th>
              <th>Poäng</th>
              <th>Vinster</th>
              <th>Lika</th>
              <th>Förluster</th>
              <th>Matcher</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Container>
    </Container>
  )
}
