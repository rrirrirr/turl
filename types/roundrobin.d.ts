type RoundRobinTable = { table: TeamPoints }
type RoundResult = { won: Result[]; lost: Result[]; drawn: Result[] }

type TeamTournamentResults = {
  points: number
  id: string
  wins: number
  losses: number
  draws: number
  played: number
}
type TeamPoints = {
  [teamName: string]: TeamTournamentResults
}
