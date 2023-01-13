import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'

export async function getServerSideProps({ params }) {
  if (params.id === 'new') {
    return {
      props: { tournament: { id: 'new', name: '', format: '', open: true } },
    }
  }
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${params.id}`
  )
  return { props: { tournament: res.data } }
}

export default function Edit({ tournament }) {
  const router = useRouter()

  async function handleSubmit(event) {
    event.preventDefault()
    let res
    if (tournament.id === 'new') {
      res = await axios.post(`${process.env.NEXT_PUBLIC_DB_HOST}/tournaments`, {
        name: event.target.name.value,
        open: event.target.open.value,
      })
    } else {
      res = await axios.patch(
        `${process.env.NEXT_PUBLIC_DB_HOST}/tournaments/${tournament.id}`,
        { name: event.target.name.value, open: event.target.open.value }
      )
    }
    if (res.status === 200) {
      router.push(`/tournaments/${res.data.id}`)
    }
  }

  return (
    <>
      <h1>{tournament.name}</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Turneringens namn:</label>
          <input
            placeholder={tournament.name}
            type="text"
            id="name"
            name="name"
            required
          />

          <label htmlFor="open">Öppen:</label>
          <select type="text" id="open" name="open" required>
            <option value={true}>Öppen</option>
            <option value={false}>Inbjudan</option>
          </select>

          <label htmlFor="name">Max antal lag:</label>
          <input type="text" id="maxteams" name="maxteams" required />

          <button type="submit">Submit</button>
        </form>
      </section>
    </>
  )
}
