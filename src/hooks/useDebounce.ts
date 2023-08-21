import { useEffect } from 'react';
import useTimeout from './useTimeout';

export default function useDebounce(callBack: () => void, delay: number, dependency: unknown | undefined) {
  const { reset } = useTimeout(callBack, delay);

  useEffect(() => {
    if (dependency !== undefined) reset();
  }, [dependency, reset]);
}
