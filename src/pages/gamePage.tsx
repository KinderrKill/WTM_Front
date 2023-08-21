/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GameResult,
  GameType,
  PHASE,
  PhaseType,
  Player,
  SendCookieData,
  SocketUpdatePlayerState,
  UpdateGame,
} from '@/utils/types';

import clipboardIcon from '../assets/icons/clipboard-list.svg';
import userCircle from '../assets/icons/user-circle-alt.svg';
import { socket } from '@/socket';
import { COOKIE_NAME } from '@/utils/utils';
import GifPanel from './gifPanel';
import VotePage from './votePage';
import PodiumPage from './podiumPage';

export default function GamePage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const stateJoiner: Player = state.joiner as Player;
  const stateGame: GameType = state.game as GameType;

  const [phase, setPhase] = useState<PhaseType>(PHASE.PENDING);

  const [game, setGameData] = useState<GameType>();
  const [round, setRound] = useState<number>(0);
  const [sentences, setSentences] = useState<string[]>([]);

  const [displayGifPanel, setDisplayGifPanel] = useState<boolean>(false);
  const [displayGameId, setDisplayGameId] = useState<boolean>(false);

  // Countdown before launch
  const LAUNCH_COUNTDOWN_VALUE = 3;
  const [launchCountdown, setLaunchCountdown] = useState(LAUNCH_COUNTDOWN_VALUE);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timer | null>(null);

  // Countdown before next round
  const ROUND_COUNTDOWN_VALUE = 120;
  const [roundCountdown, setRoundCountdown] = useState(ROUND_COUNTDOWN_VALUE);
  const [roundCountdownInterval, setRoundCountdownInterval] = useState<NodeJS.Timer | null>(null);

  const [finalResults, setFinalResults] = useState<GameResult[] | undefined>(undefined);

  // UseEffect on Page
  useEffect(() => {
    handlePageLoad();

    if (!game && stateGame) {
      setGameData(stateGame);
    }

    socket.on('send_cookie', (data: SendCookieData) => {
      localStorage.setItem('username', data.username);
      document.cookie = data.cookie;
    });

    socket.on('remove_cookie', (cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    socket.on('update_game', (data: UpdateGame) => {
      if (data.game === undefined) return;
      setGameData(data.game);
    });

    return () => {
      socket.off('send_cookie');
      socket.off('remove_cookie');
      socket.off('update_game');
      socket.off('update_player_ready');
    };
  }, []);

  // useEffect on Game
  useEffect(() => {
    socket.on('update_player_ready', (data: SocketUpdatePlayerState) => {
      if (game === undefined || data === undefined) return;

      setGameData((prevData) => {
        if (prevData === undefined) return prevData;
        const updatedPlayers = prevData.players.map((player) =>
          player.uuid === data.playerUUID ? { ...player, readyToPlay: !player.readyToPlay } : player
        );

        return {
          ...prevData,
          players: updatedPlayers,
        };
      });

      if (data.launchCountdown) {
        const interval = setInterval(() => {
          setLaunchCountdown((prevValue) => {
            if (prevValue <= 0) {
              clearInterval(interval);
              setPhase(PHASE.DRAFT);
              setCountdownInterval(null);
              setLaunchCountdown(LAUNCH_COUNTDOWN_VALUE);
              return LAUNCH_COUNTDOWN_VALUE;
            }
            return prevValue - 1;
          });
        }, 1000);

        setCountdownInterval(interval);
      } else if (countdownInterval) {
        clearInterval(countdownInterval);
        setLaunchCountdown(LAUNCH_COUNTDOWN_VALUE);
      }
    });

    socket.on('new_round', (sentence: string) => {
      console.log('New round started ', sentence);

      setSentences((prevValue) => {
        prevValue.push(sentence);
        return prevValue;
      });

      setRound((prevValue) => prevValue + 1);

      if (roundCountdownInterval) {
        clearInterval(roundCountdownInterval);
        setRoundCountdown(ROUND_COUNTDOWN_VALUE);
        setRoundCountdownInterval(null);
      }

      const interval = setInterval(() => {
        setRoundCountdown((prevValue) => {
          if (prevValue <= 0) {
            setRoundCountdown(ROUND_COUNTDOWN_VALUE);
            setRoundCountdownInterval(null);
            clearInterval(interval);

            return ROUND_COUNTDOWN_VALUE;
          }
          return prevValue - 1;
        });
      }, 1000);

      setRoundCountdownInterval(interval);
    });

    socket.on('last_round_finished', () => {
      setPhase(PHASE.VOTE);
    });

    socket.on('display_podium', (results: GameResult[]) => {
      setFinalResults(results);
    });

    return () => {
      socket.off('update_player_ready');
      socket.off('send_sentence');
      socket.off('new_round');
      socket.off('last_round_finished');
      socket.off('display_podium');
    };
  }, [game]);

  function handlePageLoad() {
    if (document.cookie.length > 0) {
      socket.emit('page_reload', { cookie: document.cookie });
    } else {
      socket.emit('page_load', stateJoiner);
    }
  }

  function handlePublicGameCheckbox(event: React.ChangeEvent<HTMLInputElement>) {
    const chekbox = event.target as HTMLInputElement;

    if (game === undefined || game?.owner.uuid !== stateJoiner.uuid) {
      chekbox.checked = false;
      return;
    }

    socket.emit('update_game_visibility', game.id);
  }

  function backToHome() {
    socket.emit('quit_game', { cookie: document.cookie });
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    navigate('/');
  }

  return (
    <>
      {!game ? (
        <span>ERROR</span>
      ) : (
        <div className='bg-gray-800 h-screen overflow-y-hidden'>
          {displayGifPanel && (
            <GifPanel
              setDisplayGifPanel={setDisplayGifPanel}
              round={round}
              sentence={sentences[game.actualRound]}
              joinerUUID={stateJoiner.uuid}
            />
          )}
          <section className='container mx-auto h-full flex flex-col justify-around py-10'>
            <button
              onClick={backToHome}
              className='absolute top-0 left-0 bg-wtm_blue p-3 m-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors'>
              Retourner à l'accueil
            </button>
            {phase === PHASE.PENDING ? (
              <>
                <article className='text-center'>
                  <h1 className='text-[8rem] font-bold'>LOBBY</h1>
                  <div className='flex justify-center items-center content-center gap-4'>
                    <span className='text-2xl'>Code de la partie :</span>
                    <span
                      className='text-2xl font-bold cursor-pointer bg-gray-500 bg-opacity-50 hover:bg-opacity-75 rounded-md px-2'
                      onClick={() => setDisplayGameId((prevValue) => !prevValue)}>
                      {displayGameId ? game.id : '******'}
                    </span>
                    <img
                      src={clipboardIcon}
                      alt=''
                      onClick={() => navigator.clipboard.writeText(game.id)}
                      className='cursor-pointer'
                    />
                  </div>
                  {game?.owner.uuid === stateJoiner.uuid && (
                    <div className='p-4'>
                      <span className=''>Partie publique :</span>
                      <input type='checkbox' className='ml-2' onChange={(e) => handlePublicGameCheckbox(e)} />
                    </div>
                  )}
                </article>

                <article className='grow w-full my-10 p-10 flex justify-around'>
                  <div className='border w-1/2 p-5'>
                    <span className='text-xl underline'>Liste des joueurs ({game.players.length}) :</span>
                    <ul className='mt-10 flex flex-col gap-4'>
                      {game.players.map((item, index) => (
                        <li key={index} className='flex items-center gap-2 text-xl'>
                          <img src={userCircle} alt='UserCircle' />
                          <span className={'text-2xl ' + (game.owner.uuid === item.uuid && 'text-yellow-500')}>
                            {item.username}
                          </span>
                          {item.readyToPlay ? (
                            <span className='bg-green-600  px-2 py-1 rounded-lg'>Prêt à jouer !</span>
                          ) : (
                            <span className='bg-gray-400 text-gray-100 px-2 py-1 rounded-lg'>En attente...</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='border w-1/2 p-5'>
                    <span className='text-xl underline'>Comment jouer ? </span>
                    <ul className='mt-10 flex flex-col gap-4 text-lg'>
                      <li>Une phrase vous sera automatiquement proposée</li>
                      <li>Veuillez choisir un Gif correspondant le mieux à cette phrase</li>
                      <li>Vous avez 5 manches au total</li>
                      <li>A la fin de ces 5 manches vous pouvez voter pour l'association la plus drôle</li>
                      <li>L'auteur du Gif sera dévoilé une fois le vote terminé</li>
                      <li>Le podium final sera dévoilé à la fin des votes</li>
                    </ul>
                  </div>
                </article>

                <article className='flex flex-col text-center'>
                  <span className='text-2xl mb-10'>
                    {allPlayersIsReady(game)
                      ? `Lancement de la partie dans ${launchCountdown}`
                      : `En attente des joueurs prêts (${game.players.filter((player) => player.readyToPlay).length} /
                    ${Math.max(1, game.players.length)})`}
                  </span>
                  <button
                    onClick={handleReadyToPlay}
                    className='bg-wtm_blue py-6 rounded-lg hover:bg-blue-800 transition-colors w-1/2 mx-auto mb-10 text-3xl'>
                    {allPlayersIsReady(game) ? 'Annuler le lancement' : 'Prêt à jouer !'}
                  </button>
                </article>
              </>
            ) : game.phase === PHASE.DRAFT ? (
              <>
                <article>
                  <h1 className='text-center text-[6rem] font-bold'>MANCHE {round}</h1>
                </article>

                <article>
                  <ul className='flex gap-4 justify-center'>
                    {game.players?.map((item, index) => (
                      <li
                        key={index}
                        className={
                          'flex items-center gap-2 text-xl px-5 py-2 rounded-full ' +
                          (playerHaveChoosenAGif(game, item, round) ? 'bg-green-500' : 'bg-gray-500')
                        }>
                        <img src={userCircle} alt='UserCircle' />
                        <span className='text-2xl'>{item.username}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className='bg-gray-900 flex flex-col border mx-auto w-1/2 max-w-full'>
                  <div className='border-b py-5 px-3 italic text-xl'>
                    <span className=''>MANCHE {round}</span>
                  </div>
                  <div className='mx-10 my-10 flex flex-col gap-4 h-auto overflow-hidden'>
                    <span className='text-xl mb-5 font-bold'>{sentences[game.actualRound]}</span>
                    {getPlayerChoice(game, stateJoiner, round) === undefined ? (
                      <div
                        className='bg-gray-700 rounded-lg w-full h-80 text-center flex items-center hover:bg-gray-600 cursor-pointer transition-all group'
                        onClick={() => setDisplayGifPanel((prevValue) => !prevValue)}>
                        <span className='italic max-h-80 w-full group-hover:text-yellow-300 transition-colors'>
                          Il est encore temps de sélectionner un GIF !
                        </span>
                      </div>
                    ) : (
                      <div
                        className='bg-gray-700 rounded-lg h-auto w-full flex justify-center items-center hover:bg-gray-600 cursor-pointer transition-all group'
                        onClick={() => setDisplayGifPanel((prevValue) => !prevValue)}>
                        <img
                          src={getPlayerChoice(game, stateJoiner, round)?.choice}
                          alt=''
                          className='object-contain max-h-80 w-full group-hover:brightness-50 transition-all'
                        />
                      </div>
                    )}
                  </div>
                </article>

                <article className='w-[50%] mx-auto text-center flex flex-col gap-5'>
                  <span className='text-xl text-center'>Temps restants : {roundCountdown} sec</span>
                </article>
              </>
            ) : game.phase === PHASE.VOTE ? (
              <VotePage game={game} sentences={sentences} />
            ) : (
              game.phase === PHASE.RESULT && finalResults && <PodiumPage results={finalResults} sentences={sentences} />
            )}
          </section>
        </div>
      )}
    </>
  );
}

function handleReadyToPlay() {
  socket.emit('ready_to_play', { cookie: document.cookie });
}

function allPlayersIsReady(game: GameType) {
  return game.players.length >= 1 && game.players.every((p) => p.readyToPlay);
}

function playerHaveChoosenAGif(game: GameType, player: Player, round: number) {
  return game.playersChoices.some((o) => o.round === round && o.uuid === player.uuid);
}

function getPlayerChoice(game: GameType, player: Player, round: number) {
  return game.playersChoices.find((o) => o.round === round && o.uuid === player.uuid);
}
