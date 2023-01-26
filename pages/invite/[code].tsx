import { Box, Button, Center, Group, Stack } from '@mantine/core'
import axios from 'axios'
import {
  GetServerSidePropsContext,
  GetStaticPathsContext,
  GetStaticPropsContext,
} from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

// export async function getStaticPaths() {
//   const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/invitations`)
//   const invites = res.data

//   const paths = invites.map((invite) => ({
//     params: { code: invite.code },
//   }))
//   return { paths, fallback: false }
// }

// export async function getStaticProps({ params }) {
//   const res = await axios.get(
//     `${process.env.NEXT_PUBLIC_DB_HOST}/invitations/${params.code}`
//   )
//   return { props: { data: res.data } }
// }

// export async function getStaticPaths() {
//   console.log('fettth')

//   const res = await axios.get(`${process.env.NEXT_PUBLIC_DB_HOST}/invites`)
//   console.log('nnnn')
//   console.log(res)
//   const invites: Invite[] = res.data

//   const paths = invites.map((invite) => ({
//     params: { code: invite.code },
//   }))
//   return { paths, fallback: false }
// }

// export async function getStaticProps(
//   context: GetStaticPropsContext<{
//     code: string
//   }>
// ) {
//   const code = context?.params?.code
//   try {
//     const inviteRes = await axios.get(
//       `${process.env.NEXT_PUBLIC_DB_HOST}/invites?code=${code}`
//     )
//     const invite = inviteRes.data[0]
//     const tournament = invite.tournament
//     return {
//       props: { invite: invite, tournament: tournament },      revalidate: 10,
//     }
//   } catch (error) {
//     console.log(error)
//   }
//   return { props: { invite: null, tournament: null },       revalidate: 10, }
// }

//TEMPORARY
export async function getServerSideProps(context: any) {
  const code = context?.params?.code
  try {
    const inviteRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites?code=${code}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_DB_TOKEN,
        },
      }
    )
    const invite = inviteRes.data[0]
    const tournament = invite.tournament
    return {
      props: { invite: invite, tournament: tournament },
    }
  } catch (error) {
    console.log(error)
  }
  return { props: { invite: null, tournament: null } }
}

interface InviteElements extends HTMLFormControlsCollection {
  [key: number]: HTMLInputElement
}

interface InviteForm extends HTMLFormElement {
  readonly elements: InviteElements
}

interface Props {
  invite: Invite
  tournament: Tournament
}
interface PendingPlayer {
  [key: string]: string | null
}

export default function Invite({ invite, tournament }: Props) {
  const router = useRouter()
  console.log(invite)
  console.log(tournament)
  const [players, setPlayers] = useState<Array<PendingPlayer | string>>(
    Array(tournament?.min_num_players_in_team || 0)
      .fill('')
      .map((_, i) => {
        return { [`first_name${i}`]: null, [`last_name${i}`]: null }
      })
  )
  const [hiddenPlayers, setHiddenPlayers] = useState<
    Array<PendingPlayer | number>
  >([])

  if (!invite) {
    return <>Hittade inget.</>
  }

  if (invite.used) {
    return <>Inbjudan är använd och går inte att användas igen.</>
  }

  //TEMPORARY
  // if (new Date(invite.expiration_date) < new Date()) {
  //   return <>Inbjudan har gått ut!</>
  // }

  //change to controlled form
  async function acceptInvite(event: FormEvent<InviteForm>) {
    event.preventDefault()
    try {
      const playersToAdd = players
        .map((p, i) => {
          return {
            first_name: event.target[`firstName${i}`].value,
            last_name: event.target[`lastName${i}`].value,
          }
        })
        .filter((p, i) => !hiddenPlayers.includes(i))
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_DB_HOST}/teams`,
        {
          name: event.target.name.value,
          tournament: tournament.id,
          seed: 0,
          player: playersToAdd,
        },
        {
          headers: {
            inviteCode: `${invite.code}`,
          },
        }
      )
      console.log(res.data)
      if (res.status === 201) {
        const code = res.data.team_code
        router.push(`/team/${code}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Center>
      <Stack>
        <Box>
          <h1>Anmälan till {tournament.name}</h1>
        </Box>
        <Box>
          <form onSubmit={acceptInvite}>
            <label htmlFor="name">Lagets namn:</label>
            <input type="text" id="name" name="name" required />
            <p>Minst {tournament.min_num_players_in_team} spelare i laget.</p>
            {players.map((player, i) => (
              <Box
                key={i}
                m="0.4rem"
                style={{
                  display: hiddenPlayers.includes(i) ? 'none' : 'block',
                }}
              >
                <label htmlFor={`firstName${i}`}>Förnamn:</label>
                <input
                  type="text"
                  id={`firstName${i}`}
                  name={`firstName${i}`}
                />
                <label htmlFor={`lastName${i}`}>Efternamn:</label>
                <input type="text" id={`lastName${i}`} name={`lastName${i}`} />
                {tournament.min_num_players_in_team === undefined ||
                  (i >= tournament.min_num_players_in_team && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setHiddenPlayers([...hiddenPlayers, i])
                      }}
                    >
                      ta bort
                    </Button>
                  ))}
              </Box>
            ))}
            <Group m="0.5rem">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  setPlayers([...players, ''])
                }}
              >
                Lägg till fler spelare
              </Button>

              <Button type="submit">Skapa</Button>
            </Group>
          </form>
        </Box>
      </Stack>
    </Center>
  )
}
