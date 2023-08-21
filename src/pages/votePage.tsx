/* eslint-disable react-hooks/exhaustive-deps */
import { GameType, LikedMeme, Player, PlayerChoice } from '@/utils/types';
import { useEffect, useState } from 'react';
import redHeart from '@/assets/icons/red-heart.svg';
import { socket } from '@/socket';
import { useLocation } from 'react-router-dom';

interface VotePageProps {
  game: GameType;
  sentences: string[];
}

export default function VotePage({ game, sentences }: VotePageProps) {
  const MAX_ROUND = 3;

  const undefinedGif =
    'https://media1.giphy.com/media/8L0Pky6C83SzkzU55a/200w.gif?cid=790b76117n43w1e6tve50a0kltmuoi0iav39se9pfgrf1vw3&ep=v1_gifs_search&rid=200w.gif&ct=g';

  const choices = game.playersChoices;

  const { state } = useLocation();
  const stateJoiner: Player = state.joiner as Player;

  const [consultRound, setConsultRound] = useState<number>(1);

  const [choicesPerRound, setChoicesPerRound] = useState<PlayerChoice[]>(choices.filter((value) => value.round === 1));

  const [likedMemes, setLikedMemes] = useState<LikedMeme[]>([]);

  useEffect(() => {
    socket.on('consult_next_page', (page) => {
      setConsultRound(page);
      setChoicesPerRound(choices.filter((value) => value.round === page));
    });

    return () => {
      socket.off('consult_next_page');
    };
  }, []);

  function incrementConsultRound() {
    if (game.owner.uuid === stateJoiner.uuid) {
      if (consultRound < MAX_ROUND) {
        socket.emit('consult_next_page', { actualRound: consultRound, cookie: document.cookie });
      } else {
        socket.emit('display_podium', { cookie: document.cookie });
      }
    }
  }

  function handleMemeLike(authorUUID: string, choice: string) {
    setLikedMemes((prevLikedMemes) => {
      const existingIndex = prevLikedMemes.findIndex((meme) => meme.round === consultRound);

      if (existingIndex !== -1) {
        const updatedMemes = [...prevLikedMemes];
        updatedMemes[existingIndex] = { authorUUID: authorUUID, round: consultRound, choice };
        return updatedMemes;
      } else {
        return [...prevLikedMemes, { authorUUID: authorUUID, round: consultRound, choice }];
      }
    });

    socket.emit('add_liked_meme', {
      cookie: document.cookie,
      uuid: authorUUID,
      round: consultRound,
      choice,
    });
  }

  function memeIsLiked(authorUUID: string, choice: string | undefined) {
    //console.log(likedMemes);

    return (
      choice !== undefined &&
      likedMemes.some((like) => like.round === consultRound && like.authorUUID === authorUUID && like.choice === choice)
    );
  }

  return (
    <>
      <article className='text-center flex flex-col gap-4'>
        <h1 className='font-bold text-7xl'>CONSULTATION</h1>

        <div className='flex flex-col text-4xl'>
          <span>
            Manche {consultRound}/{MAX_ROUND}
          </span>
          <span className='text-4xl italic mt-10'>{sentences[consultRound - 1]}</span>
        </div>
      </article>
      <article>
        <ul className='grid grid-cols-2 gap-4'>
          {choicesPerRound &&
            choicesPerRound.map((item, index) => (
              <li
                key={index}
                className={
                  'relative border flex flex-col justify-between hover:ring-2 ring-wtm_bright_orange transition-all cursor-pointer my-10 ' +
                  (memeIsLiked(item.uuid, item.choice) && 'ring-2')
                }
                onClick={() => handleMemeLike(item.uuid, item.choice === undefined ? 'undefined' : item.choice)}>
                <span className='py-3 px-3 border-b'>MEME.ts {item.uuid}</span>
                <img
                  src={!item.choice ? undefinedGif : item.choice}
                  alt=''
                  className='px-3 py-3 object-contain w-auto h-96'
                />
                {memeIsLiked(item.uuid, item.choice) && (
                  <img src={redHeart} alt='' className='absolute -top-3 -right-5 rotate-45 w-40 h-40 z-10' />
                )}
              </li>
            ))}
        </ul>
      </article>
      <article className='w-[50%] mx-auto text-center flex flex-col gap-5'>
        <button
          onClick={incrementConsultRound}
          className='bg-wtm_purple hover:bg-wtm_purple_darker transition-colors shadow-sm shadow-black w-full py-3 rounded-lg'>
          {consultRound < MAX_ROUND ? 'Manche suivante' : 'Voir le podium'}
        </button>
      </article>
    </>
  );
}
