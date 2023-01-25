type Game = {
  id: string
  name?: string
  start_date?: Date
  end_date?: Date
  active: boolean
  game_type: string
  tournament: string
  result?: Result | string
  venue?: string
  court?: string
  teams?: Team[]
}
