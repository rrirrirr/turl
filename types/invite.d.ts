type Invite = {
  id: string
  name?: string
  code?: string
  expiration_date?: Date
  tournament?: string
  unique: boolean
  used?: boolean
}
