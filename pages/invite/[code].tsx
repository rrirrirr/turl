import axios from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'

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

///Could be static?
export async function getServerSideProps({ params }) {
  try {
    const inviteRes = await axios.get(
      `${process.env.NEXT_PUBLIC_DB_HOST}/invites?code=${params.code}`
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

export default function Invite({ invite, tournament }) {
  const router = useRouter()
  const [players, setPlayers] = useState(
    Array(tournament.min_num_players_in_team)
      .fill('')
      .map((_, i) => {
        return { [`first_name${i}`]: null, [`last_name${i}`]: null }
      })
  )
  const [hiddenPlayers, setHiddenPlayers] = useState([])

  if (!invite) {
    return <>Hittade inget.</>
  }

  if (invite.used) {
    return <>Inbjudan är använd och går inte att användas igen.</>
  }

  if (new Date(invite.expiration_date) < new Date()) {
    return <>Inbjudan har gått ut!</>
  }

  async function acceptInvite(event) {
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
      console.log(playersToAdd)
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
    <section>
      <h1>Anmälan till {tournament.name}</h1>
      <form onSubmit={acceptInvite}>
        <label htmlFor="name">Lagets namn:</label>
        <input type="text" id="name" name="name" required />
        <p>Minst {tournament.min_num_players_in_team} spelare i laget.</p>
        {players.map((player, i) => (
          <div
            key={i}
            style={{
              display: hiddenPlayers.includes(i) ? 'none' : 'block',
            }}
          >
            <label htmlFor={`firstName${i}`}>Förnamn:</label>
            <input type="text" id={`firstName${i}`} name={`firstName${i}`} />
            <label htmlFor={`lastName${i}`}>Efternamn:</label>
            <input type="text" id={`lastName${i}`} name={`lastName${i}`} />
            {i >= tournament.min_num_players_in_team && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setHiddenPlayers([...hiddenPlayers, i])
                }}
              >
                ta bort
              </button>
            )}
          </div>
        ))}
        <button
          onClick={(e) => {
            e.preventDefault()
            setPlayers([...players, ''])
          }}
        >
          Lägg till fler spelare
        </button>

        <button type="submit">Skapa</button>
      </form>
    </section>
  )
}
