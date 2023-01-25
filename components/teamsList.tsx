import Link from 'next/link'

export function TeamsList({
  teams,
  handleTeamAccept,
}: {
  teams: Team[]
  handleTeamAccept: (id: string, app: Application) => any
}) {
  return (
    <ul>
      {teams.length ? (
        <ul>
          {teams.map((team) => (
            <li key={team.id}>
              <Link href={`/teamoverview/${team.id}`}>{team.name}</Link>
              {team.accepted === 'accepted' ? (
                <button onClick={() => handleTeamAccept(team.id, 'declined')}>
                  Neka
                </button>
              ) : team.accepted === 'waiting' ? (
                <div>
                  <button onClick={() => handleTeamAccept(team.id, 'accepted')}>
                    Anta
                  </button>
                  <button onClick={() => handleTeamAccept(team.id, 'declined')}>
                    Neka
                  </button>
                </div>
              ) : (
                <button onClick={() => handleTeamAccept(team.id, 'accepted')}>
                  Anta
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Inga lag</p>
      )}
    </ul>
  )
}
