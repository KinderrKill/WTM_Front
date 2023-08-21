import { GameResult } from '@/utils/types';

interface PodiumPageProps {
  results: GameResult[];
  sentences: string[];
}

interface PlayerStats {
  username: string;
  totalPoints: number;
  totalLikes: number;
}

export default function PodiumPage({ results, sentences }: PodiumPageProps) {
  const playerStatsMap: Map<string, PlayerStats> = new Map();

  results.forEach((result) => {
    const username = result.author.username;

    if (!playerStatsMap.has(username)) {
      playerStatsMap.set(username, { username, totalPoints: 0, totalLikes: 0 });
    }

    const playerStats = playerStatsMap.get(username);
    if (playerStats) {
      playerStats.totalLikes += result.likes;
      playerStats.totalPoints += result.totalPoints;
    }
  });

  const playerStatsArray = Array.from(playerStatsMap.values());

  playerStatsArray.sort((a, b) => {
    if (a.totalPoints === b.totalPoints) {
      return b.totalLikes - a.totalLikes;
    }
    return b.totalPoints - a.totalPoints;
  });

  const topPlayers = playerStatsArray.slice(0, 3);

  return (
    <>
      <section className='text-center flex flex-col gap-4'>
        <h1 className='font-bold text-7xl'>PODIUM</h1>
        <article>
          <ul className='grid grid-cols-3 gap-4'>
            {topPlayers.map((item, index) => (
              <li key={index}>
                Pos {index + 1} - {item.username} avec {item.totalPoints} points pour {item.totalLikes} likes
              </li>
            ))}
          </ul>
        </article>
        <article>
          <ul className='grid grid-cols-3 gap-4'>
            {results &&
              results.map((item, index) => (
                <li
                  key={index}
                  className='relative border flex flex-col justify-between transition-all cursor-pointer my-10 '>
                  <div className='w-full border-b flex flex-col'>
                    <span className='py-3 px-3'>
                      Manche {item.round}, vainqueur {item.author.username}
                    </span>
                    <span className='py-3 px-3'>
                      {item.totalPoints} points avec {item.likes} Likes !
                    </span>
                  </div>
                  <div className='flex flex-col text-center py-4'>
                    <span>{sentences[index]}</span>
                    <img src={item.gifUrl} alt='' className='px-3 py-3 object-contain w-auto h-96' />
                  </div>
                </li>
              ))}
          </ul>
        </article>
      </section>
    </>
  );
}
