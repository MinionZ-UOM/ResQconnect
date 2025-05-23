import { auth } from "./firebaseClient";

export async function callApi<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(`/api/${path}`, {      // ← same-origin call
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
