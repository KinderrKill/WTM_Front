import { useState } from 'react';
import { isStringEmpty } from '@/utils/utils';

interface APIData {
  data: [];
}

export default function useFetchGif() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<APIData>();

  async function fetchData(query: string | undefined) {
    setLoading(true);

    try {
      const url =
        query === undefined || query === '' || isStringEmpty(query)
          ? `https://api.giphy.com/v1/gifs/trending?api_key=${
              import.meta.env.VITE_APP_GIF_API_KEY
            }&limit=25&offset=0&rating=g&bundle=messaging_non_clips`
          : `https://api.giphy.com/v1/gifs/search?api_key=${
              import.meta.env.VITE_APP_GIF_API_KEY
            }&q=${query}&limit=25&offset=0&rating=g&lang=fr&bundle=messaging_non_clips`;
      const response = await fetch(url);
      if (!response.ok) {
        setError(response.status.toString());
      } else {
        const data = await response.json();
        setData(data);
      }
      setLoading(false);
    } catch (error: unknown) {
      setError(error?.toString());
      setLoading(false);
    }
  }

  return { loading, error, data, fetchData };
}
