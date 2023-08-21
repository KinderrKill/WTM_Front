/* eslint-disable react-hooks/exhaustive-deps */
import useDebounce from '@/hooks/useDebounce';
import useFetchGif from '@/hooks/useFetchGif';
import { socket } from '@/socket';
import { Gif } from '@/utils/types';
import React, { useEffect, useState } from 'react';

interface ChildProps {
  setDisplayGifPanel: React.Dispatch<React.SetStateAction<boolean>>;
  round: number;
  sentence: string | undefined;
  joinerUUID: string;
}

export default function GifPanel({ setDisplayGifPanel, round, sentence, joinerUUID }: ChildProps) {
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { loading, error, data, fetchData } = useFetchGif();

  const [gifs, setGifs] = useState<Gif[]>();

  useEffect(() => {
    fetchData(undefined);
  }, []);

  useEffect(() => {
    if (data) {
      setGifs(data.data);
    }
  }, [loading, error, data]);

  useDebounce(
    () => {
      fetchData(searchValue);
    },
    1000,
    searchValue
  );

  function selectGif(element: React.MouseEvent) {
    const imageElement: HTMLImageElement = element.target as HTMLImageElement;
    socket.emit('update_choice', { uuid: joinerUUID, round, choice: imageElement.src, cookie: document.cookie });
    setDisplayGifPanel(false);
  }

  return (
    <div className='flex justify-center items-center absolute top-0 left-0 bg-black bg-opacity-25 backdrop-blur-lg backdrop-brightness-50 w-full h-full z-10'>
      <section className='bg-[0x051421] flex flex-col relative w-[90%] h-[90%] border shadow-black shadow-md'>
        <article className='flex justify-between px-5 py-3 border-b'>
          <span>Choisissez votre Gif !</span>
          <button
            onClick={() => setDisplayGifPanel(false)}
            className='cursor-pointer hover:bg-gray-500 transition-colors px-3 py-1 rounded-full shadow-sm shadow-black'>
            X
          </button>
        </article>

        <article className='border-b flex justify-center py-5 px-10'>
          <span className='text-2xl'>{sentence}</span>
        </article>

        <article className='grow flex flex-col overflow-auto px-10'>
          <input
            type='text'
            placeholder='Search on Giphy'
            className='my-5 py-3 px-3 rounded-md border'
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className='overflow-y-scroll border px-5 py-5 grow mb-5'>
            <ul className='grid md:grid-cols-3 gap-4'>
              {gifs?.map((item, index) => (
                <li key={index} className='flex justify-center'>
                  <img
                    src={item.images.original.url}
                    alt={item.slug}
                    className='cursor-pointer ring-purple-200 hover:ring-2 transition-all'
                    onClick={(e) => selectGif(e)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </div>
  );
}
