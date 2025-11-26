import { API_BASE_URL } from "../config";

export async function createCardIntent(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/payments/card`
, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create card payment intent");
  }

  return res.json(); // { clientSecret }
}
