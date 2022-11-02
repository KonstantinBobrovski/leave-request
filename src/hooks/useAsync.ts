import { useEffect, useState } from "react";
import useIsFirstRender from "./useIsFirstRender";

export default function useAsync<T>(
  asyncAction: () => Promise<T>,
  deps: unknown[]
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();
  const [result, setResult] = useState<T>();
  const [promise, setPromise] = useState<Promise<T>>(asyncAction);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    let invalidRes = false;

    let actionPromise: Promise<T> = isFirstRender ? promise : asyncAction();

    setIsPending(true);
    if (!isFirstRender) setPromise(actionPromise);
    actionPromise
      .then((res) => {
        if (!invalidRes) setResult(res);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        if (!invalidRes) setIsPending(false);
      });
    //clears error and result if the deps are changed
    return () => {
      setResult(undefined);
      setError(undefined);
      invalidRes = true;
    };
  }, deps);

  return {
    isPending,
    error,
    result,
    promise,
  };
}
