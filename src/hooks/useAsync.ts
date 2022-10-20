import { useEffect, useState } from "react";

export default function useAsync<T>(
  asyncAction: () => Promise<T>,
  deps: unknown[]
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();
  const [result, setResult] = useState<T>();

  useEffect(() => {
    let invalidRes = false;
    setIsPending(true);
    asyncAction()
      .then((res) => {
        if (!invalidRes) setResult(res);
      })
      .catch((err) => {
        console.log(err);
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
  };
}
