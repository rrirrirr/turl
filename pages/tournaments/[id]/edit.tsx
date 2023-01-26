import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { User } from '../../../types/user'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import {
  Box,
  Button,
  Container,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useStyles } from '../../../styles/styles'
import { useForm } from '@mantine/form'
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates'
import { authOptions } from '../../api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth'

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

  const id = context.params?.id
  if (id === 'new') {
    return {
      props: { tournament: { id: 'new', name: 'NEW', format: '', open: true } },
    }
  }
  try {
    const tournamentRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${id}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )
    const tournament = tournamentRes.data as Tournament

    const isAdmin = tournament.tournamentAdmins.find((admin) => {
      return admin.user === session?.user.userId
    })

    if (!isAdmin && !session.user.isAdmin) {
      throw new Error('No permission')
    }

    return { props: { tournament: tournament } }
  } catch (error) {
    console.log(error)
    return {
      props: {
        tournament: {
          id: 'no',
          name: 'something is wrong',
          format: '',
          open: true,
        },
      },
    }
  }
}

export default function Edit({ tournament }: { tournament: Tournament }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dateRange, setDateRange] = useState<DateRangePickerValue>([
    tournament.start_date ? new Date(tournament.start_date) : new Date(),
    tournament.end_date ? new Date(tournament.end_date) : new Date(),
  ])

  const [startDate, setStartDate] = useState<Date>(
    tournament.start_date ? new Date(tournament.start_date) : new Date()
  )
  const [endDate, setEndDate] = useState<Date>(
    tournament.end_date ? new Date(tournament.end_date) : new Date()
  )

  const { classes } = useStyles()

  const form = useForm({
    initialValues: {
      name: tournament?.name || '',
      open: 'true',
      format: tournament.format || '',
      game_type: tournament.game_type || '',
      min_num_players_in_team: tournament.min_num_players_in_team || 4,
      max_num_teams: tournament.max_num_teams || 16,
      description: tournament.description || '',
      venue: tournament.venue || '',
    },
  })

  if (!session) {
    return <p>Du måste logga in</p>
  }

  if (tournament.id === 'no') {
    return <p>Finns ingen turnering eller saknar behörighet</p>
  }

  async function handleSubmit(
    update: Omit<Tournament, 'start_date' | 'id' | 'end_date' | 'open'> & {
      open: string
    }
  ): Promise<void> {
    let res
    if (!session) {
      return
    }
    try {
      if (tournament.id === 'new') {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`,
          {
            ...update,
            start_date: dateRange[0],
            end_date: dateRange[1],
            open: update.open === 'true',
          },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        )
      } else {
        res = await axios.patch(
          `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournament.id}`,
          {
            ...update,
            start_date: dateRange[0],
            end_date: dateRange[1],
            open: update.open === 'true',
          },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        )
      }
      router.push(`/tournaments/${res.data.id}`)
    } catch (error) {
      console.log(error)
    }
  }

  if (!session) {
    return <p>No permission</p>
  }

  return (
    <Container>
      <Box className={classes.container} p="0">
        <Box className={classes.titleBox}>
          <h1>{tournament.name}</h1>
        </Box>

        <Container size="xs">
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <TextInput
              withAsterisk
              required
              placeholder="Turneringens namn"
              label="Namn"
              {...form.getInputProps('name')}
            />

            <Select
              withAsterisk
              required
              label="Speltyp"
              placeholder="Speltyp"
              data={[{ value: 'hockey', label: 'Hockey' }]}
              {...form.getInputProps('game_type')}
            />

            <Select
              withAsterisk
              required
              label="Öppen för alla eller inbjudan"
              placeholder="Turneringens typ"
              data={[
                { value: 'true', label: 'Öppen' },
                { value: 'false', label: 'Inbjudan' },
              ]}
              {...form.getInputProps('open')}
            />

            <DateRangePicker
              label=" Välj datum"
              placeholder="Pick dates range"
              value={dateRange}
              onChange={setDateRange}
            />
            <Select
              withAsterisk
              required
              label="Format"
              placeholder="Spelform"
              data={[{ value: 'round robin', label: 'Round robin' }]}
              {...form.getInputProps('format')}
            />

            <NumberInput
              defaultValue={16}
              label="Max antal lag"
              withAsterisk
              required
              {...form.getInputProps('max_num_teams')}
            />
            <NumberInput
              defaultValue={4}
              label="Minst antal spelare i ett lag"
              withAsterisk
              required
              {...form.getInputProps('min_num_players_in_team')}
            />

            <Textarea
              placeholder="Beskrivning"
              label="Beskrivning"
              autosize
              minRows={2}
              {...form.getInputProps('description')}
            />

            <Button type="submit">Spara</Button>
          </form>
        </Container>
      </Box>
    </Container>
  )
}
