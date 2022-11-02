//API allows up to 3 req per second so we should try
export default function ReFetcher(
  url: string,
  options?: RequestInit,
  attempsLeft = 5
): Promise<Response> {
  return new Promise((res, rej) => {
    fetch(url, options)
      .then((response) => {
        if (response.status > 299)
          throw new Error("Response status is not 2XX");
        res(response);
      })
      .catch((err) => {
        if (attempsLeft === 0) {
          rej(new Error("Attemps for refetch ended", { cause: err }));
          console.log("ZERO");
        } else
          setTimeout(() => {
            ReFetcher(url, options, attempsLeft - 1)
              .then((response) => res(response))
              .catch((err) => rej(err));
          }, Math.random() * 2000 + 500);
      });
  });
}
