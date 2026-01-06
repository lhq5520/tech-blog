import { useState, useEffect } from "react"


export const useFetch = <T> (fetchFunction: () => Promise<T>) =>{
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchFunction]);

  return {data, setData, loading, error}
};