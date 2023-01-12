import { useEffect, useState } from "react";

export interface FetchInfo {
  status: string;
  data?: any;
  err?: string;
}

export function useAsyncResponse(asyncResponse: Promise<Response> | null): FetchInfo {
  const [fetchState, setFetchState] = useState<FetchInfo>({ status: 'idle' })

  useEffect(() => {
    const getData = async () => {
      setFetchState(() => ({ status: 'fetching' }));
      try {
        const resp = await asyncResponse;
        if (resp == null) {
          setFetchState(() => ({ status: 'error', err: 'null response' }));
        } else {
          const json = await resp.json();
          setFetchState(() => ({ status: 'done', data: json }));
        }
      } catch (err) {
        if (err instanceof Error) {
          const errMessage = err.message;
          setFetchState(() => ({ status: 'error', err: errMessage }));
        }
      }
    }
    if (asyncResponse != null) getData();
  }, [asyncResponse]);

  return fetchState;
}
