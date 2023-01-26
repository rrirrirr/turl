type Tournament = {
  id: string
  description: string
  format: string
  name: string
  max_num_teams?: number
  min_num_players_in_team?: number
  start_date: Date
  end_date: Date
  venue?: string
  open: boolean
  game_type: string
  tournamentAdmins: { id: string; user: string; tournament: string }[]
  games?: Game[]
  teams?: Team[]
  invites?: Invite[]
}
