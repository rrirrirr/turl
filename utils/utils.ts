export function createScoreObject(teams: Team[]): Result {
  return teams?.length
    ? teams.reduce((obj, team) => ({ ...obj, [team.name]: { score: 0 } }), {})
    : {}
}
