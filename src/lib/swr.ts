export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const postFetcher = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};
