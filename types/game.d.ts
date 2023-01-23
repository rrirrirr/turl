type Game = {
  id: string
  name?: string
  startTime: Date
  endTime: Date
  active: boolean
  gameType: string
  tournament: string
  result: Result
  venue: string
  court: string
  result?: Result | string
}
