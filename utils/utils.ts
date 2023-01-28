import { compareAsc, compareDesc } from 'date-fns'

export function createScoreObject(teams: Team[]): Result {
  return teams?.length
    ? teams.reduce((obj, team) => ({ ...obj, [team.name]: { score: 0 } }), {})
    : {}
}

export function sortGames(games: Game[], order: 'ASC' | 'DESC') {
  return order === 'ASC'
    ? games.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    : games.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
}

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

type RoundRobinTable = { table: TeamPoints }
type RoundResult = { won: Result[]; lost: Result[]; drawn: Result[] }

export function createRoundRobinTable(
  games: Game[],
  teams: Team[],
  {
    pointsForWin,
    pointsForDraw,
    pointsForDrawLose,
    pointsForDrawWin,
  }: {
    pointsForWin: number
    pointsForDraw?: number
    pointsForDrawLose?: number
    pointsForDrawWin?: number
  }
): RoundRobinTable {
  const startTable = teams.reduce((accTable: TeamPoints, team: Team) => {
    accTable[team.name] = {
      points: 0,
      id: team.id,
      wins: 0,
      losses: 0,
      draws: 0,
      played: 0,
    }
    return accTable
  }, {})

  const resultsTable = games.reduce((table: TeamPoints, game): TeamPoints => {
    if (game.end_date && game.result) {
      const results = <Result[]>Object.entries(game.result)
      const result = results.reduce(
        (res: RoundResult, teamsScore: Result): RoundResult => {
          if (!res.won.length) {
            res.won = [teamsScore]
            return res
          }
          if (teamsScore[1].score === res.won[0][1].score) {
            res.won = [...res.won, teamsScore]
            return res
          }
          if (teamsScore[1].score > res.won[0][1].score) {
            res.lost = [...res.lost, ...res.won, ...res.drawn]
            res.drawn = []
            res.won = [teamsScore]
            return res
          }
          res.lost = [...res.lost, teamsScore]
          return res
        },
        { won: [], drawn: [], lost: [] }
      )
      if (result.won.length > 1) {
        result.drawn = [...result.won]
        result.won = []
      }

      if (result.won.length) {
        result.won.forEach((team) => {
          const teamName = team[0]
          if (teamName in table === false) {
            table[teamName] = {
              points: 0,
              id: 'unknown',
              wins: 0,
              losses: 0,
              draws: 0,
              played: 0,
            }
          }
          table[teamName].points = table[teamName].points + pointsForWin
          table[teamName].played = table[teamName].played + 1
          table[teamName].wins = table[teamName].wins + 1
        })
      }

      if (result.drawn.length) {
        result.drawn.forEach((team) => {
          const teamName = team[0]
          if (teamName in table === false) {
            table[teamName] = {
              points: 0,
              id: 'unknown',
              wins: 0,
              losses: 0,
              draws: 0,
              played: 0,
            }
          }
          table[teamName].points = table[teamName].points + (pointsForDraw || 0)
          table[teamName].played = table[teamName].played + 1
          table[teamName].draws = table[teamName].draws + 1
        })
      }

      if (result.lost.length) {
        result.lost.forEach((team) => {
          const teamName = team[0]
          if (teamName in table === false) {
            table[teamName] = {
              points: 0,
              id: 'unknown',
              wins: 0,
              losses: 0,
              draws: 0,
              played: 0,
            }
          }
          table[teamName].played = table[teamName].played + 1
          table[teamName].losses = table[teamName].losses + 1
        })
      }
    }
    return table
  }, startTable)
  return { table: resultsTable }
}

export function sortRoundRobinTable(
  table: RoundRobinTable
): { name: string; info: TeamTournamentResults }[] {
  const teamsResults = Object.entries(table.table)
  const sortedResults = teamsResults.sort((a, b) => {
    return b[1].points - a[1].points
  })
  const cleanedResults = sortedResults.map((teamResult) => {
    return { name: teamResult[0], info: teamResult[1] }
  })

  return cleanedResults
}

export function generateRoundRobinSchedule(
  teams: Team[],
  groupSize: number
): Schedule {
  const pairs = generatePairs(teams)
  const groupings = gameGroupings(pairs, groupSize)
  const schedule = groupings.map((group) => {
    return { games: group, startDate: new Date() }
  })
  return schedule
}

//Make Generic!!! or for teams
function generatePairs(items: any[]): [any, any][] {
  let pairs: [any, any][] = []
  while (items.length > 1) {
    const itemToPair: [any, any] = items.shift()
    const newPairs = items.map((item): [any, any] => [item, itemToPair])
    pairs = [...pairs, ...newPairs]
  }
  return pairs
}

function gameGroupings(games: [Team, Team][], groupingSize: number) {
  let groups: [Team, Team][][] = []
  let currentGroupingSize = 0
  let currentGroup: [Team, Team][] = []
  while (games.length) {
    if (currentGroup.length === 0) {
      const gameToAdd = games.pop()
      if (gameToAdd) currentGroup.push(gameToAdd)
    }
    if (currentGroup.length === groupingSize) {
      groups = [...groups, currentGroup]
      currentGroup = []
    }
    const indexOfNext = games.findIndex((game) => {
      return game.every((team) => {
        return currentGroup.every(
          (addedGame) =>
            !addedGame.find((team_) => {
              return team_.name === team.name
            })
        )
      })
    })
    if (indexOfNext > -1) {
      currentGroup.push(games[indexOfNext])
      games.splice(indexOfNext, 1)
    } else {
      groups = [...groups, currentGroup]
      currentGroup = []
    }
  }
  return [...groups, currentGroup]
}
