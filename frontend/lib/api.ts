import { auth } from "./firebaseClient";

export async function callApi<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : undefined;

  const res = await fetch(`/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Try to extract structured JSON error, else fall back to text
    let errBody: unknown;
    try {
      errBody = await res.json();
      console.error(`API error ${res.status}:`, errBody);
    } catch {
      const text = await res.text();
      console.error(`API error ${res.status}:`, text);
      errBody = text;
    }
    throw new Error(
      typeof errBody === "string" ? errBody : JSON.stringify(errBody)
    );
  }

  return res.json();
}
