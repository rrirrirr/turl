type Invite = {
  id: string
  name?: string
  code: string
  expirationDate: Date
  tournamentId: string
  used?: boolean
}
