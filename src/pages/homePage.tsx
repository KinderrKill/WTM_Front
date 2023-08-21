/* eslint-disable react-hooks/exhaustive-deps */
import { socket } from '@/socket';
import { GotoGameData } from '@/utils/types';
import { VERSION } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  const [displayJoinPanel, setDisplayJoinPanel] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [gameId, setGameId] = useState<string | undefined>(undefined);

  useEffect(() => {
    handlePageLoad();

    socket.on('goto_game', (data: GotoGameData) => {
      navigate('/game', { state: data });
    });

    return () => {
      socket.off('goto_game');
    };
  }, []);

  function handlePageLoad() {
    const storage = localStorage.getItem('username');
    if (storage) setUsername(storage);
  }

  return (
    <div className='w-2/3 h-screen flex flex-col justify-center mx-auto'>
      <article className='flex flex-col justify-center items-center'>
        <span className='text-[6rem] tracking-wide bg-transparent'>WHAT THE</span>
        <span className='text-[10rem] font-bold -mt-20 bg-transparent'>MEME</span>
        <span className='text-4xl text-red-600'>LE JEU N'EST PAS ENCORE FONCTIONEL !</span>
        <span>
          Server adress is {import.meta.env.VITE_APP_DEV_SOCKET_ENDPOINT} | {import.meta.env.API_URL}
        </span>
      </article>

      {displayJoinPanel ? (
        <article className='mt-10 mx-5'>
          <input
            type='text'
            id='text'
            className='w-full px-3 py-4 text-lg rounded-xl bg-white bg-opacity-25 border placeholder:text-gray-200 placeholder:italic font-bold'
            placeholder='Pseudo'
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type='text'
            id='text'
            className='w-full mt-5 px-3 py-4 text-lg rounded-xl bg-white bg-opacity-25 border placeholder:text-gray-200 placeholder:italic font-bold'
            placeholder='Code de la partie'
            onChange={(e) => setGameId(e.target.value)}
          />
          <article className='grid grid-cols-7 gap-2'>
            <button
              onClick={() => setDisplayJoinPanel((prevValue) => !prevValue)}
              className='mt-5 w-full bg-wtm_orange hover:bg-wtm_orange_darker shadow-md shadow-wtm_orange p-3 hover:scale-[1.02] rounded cursor-pointer transition-all uppercase font-medium col-span-2'>
              Accueil
            </button>
            <button
              onClick={() => handleClickJoinGame(username, gameId)}
              className='mt-5 w-full bg-wtm_light_blue hover:bg-wtm_light_blue_darker shadow-md shadow-wtm_blue p-3 hover:scale-[1.02] rounded cursor-pointer transition-all uppercase font-medium col-span-5'>
              Join the game
            </button>
          </article>
        </article>
      ) : (
        <article className='mt-10 mx-5'>
          <input
            type='text'
            id='text'
            className='w-full px-3 py-4 text-lg rounded-xl bg-white bg-opacity-25 border placeholder:text-gray-200 placeholder:italic font-bold'
            placeholder='Pseudo'
            defaultValue={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <article className='flex gap-4'>
            <button
              onClick={() => setDisplayJoinPanel((prevValue) => !prevValue)}
              className='mt-5 w-full bg-wtm_light_blue hover:bg-wtm_light_blue_darker shadow-md shadow-wtm_blue p-3 hover:scale-[1.02] rounded cursor-pointer transition-all uppercase font-medium'>
              Rejoindre une partie privée
            </button>
            <button
              onClick={() => handleClickCreateGame(username)}
              className='mt-5 w-full bg-wtm_pink hover:bg-wtm_pink_darker shadow-md shadow-wtm_bright_purple hover:scale-[1.02] p-3 rounded cursor-pointer transition-all uppercase font-medium'>
              Créer une partie privée
            </button>
          </article>

          <article className='mx-auto mt-10 flex justify-center'>
            <button
              onClick={() => handleClickQuickGame(username)}
              className='bg-green-500 py-5 rounded-lg px-10 shadow-md shadow-green-300 uppercase hover:bg-green-700 cursor-pointer hover:scale-[1.02] transition-all'>
              Partie rapide
            </button>
          </article>
        </article>
      )}

      <article className='absolute left-0 bottom-0 w-full text-center py-5 bg-wtm_blue flex flex-col'>
        <span>
          Crafted with ❤ by{' '}
          <a href='https://e-code.dev/' target={'_blank'} className='font-bold cursor-pointer'>
            ECode
          </a>{' '}
          | Version {VERSION}
        </span>
      </article>
    </div>
  );
}

function handleClickJoinGame(username: string | undefined, id: string | undefined) {
  if (username === undefined || id === undefined) return;

  socket.emit('join_game', { player: { username }, game: { id }, cookie: document.cookie });
}

function handleClickCreateGame(username: string | undefined) {
  console.log('HandleClickCreateGame');

  if (username === undefined) return;

  console.log('SocketEmit', socket);

  socket.emit('create_game', { player: { username }, cookie: document.cookie });
}

function handleClickQuickGame(username: string | undefined) {
  if (username === undefined) return;

  socket.emit('quick_game', { player: { username }, cookie: document.cookie });
}
