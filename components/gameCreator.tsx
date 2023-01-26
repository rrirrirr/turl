import { FormEvent, useState } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

interface GameElements extends HTMLFormControlsCollection {
  team1: HTMLInputElement
  team2: HTMLInputElement
}

interface GameForm extends HTMLFormElement {
  readonly elements: GameElements
}

export function GameCreator({
  teams,
  addTeam,
}: {
  teams: Team[]
  addTeam: (args: { startDate: Date; teamIds: string[] }) => any
}) {
  const [startDate, setStartDate] = useState(new Date())

  function handleSubmit(event: FormEvent<GameForm>) {
    event.preventDefault()
    const team1 = event.target.team1.value
    const team2 = event.target.team2.value
    if (team1 === team2) {
      alert('Du måste välja två olika lag')
      return
    }

    addTeam({
      startDate,
      teamIds: [event.target.team1.value, event.target.team2.value],
    })
  }

  return (
    <>
      <DatePicker
        selected={startDate}
        onChange={(date: Date) => setStartDate(date)}
        showTimeSelect
        dateFormat="Pp"
      />
      <form onSubmit={(event) => handleSubmit(event)}>
        <label htmlFor="open">Lag 1:</label>
        <select id="team1" name="team1">
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select id="team2" name="team2">
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button>Skapa</button>
      </form>
    </>
  )
}
