export type User = {
  id: string
  first_name?: string
  last_name?: string
  username: string
  email: string
  teams?: Team[]
  games?: Game[]
  tournaments?: Tournament[]
}
