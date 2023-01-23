import { useState } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

export function InviteCreator({ creator }) {
  const [expiration, setExpiration] = useState(new Date())
  return (
    <div>
      <DatePicker
        selected={expiration}
        onChange={(date: Date) => setExpiration(date)}
        showTimeSelect
        dateFormat="Pp"
      />

      <button onClick={() => creator(expiration)}>Skapa inbjudan</button>
    </div>
  )
}
