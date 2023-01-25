type Team = {
  id: string
  name: string
  owner?: string
  tournament: string | Tournament
  team_code?: string
  accepted: boolean | string
  player?: Player[]
}
