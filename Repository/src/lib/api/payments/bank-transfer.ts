import { API_BASE_URL, getAuthHeaders } from "../config";

export type BankTransferData = Record<string, unknown>;

export async function createBankTransfer(data: BankTransferData): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Bank transfer failed");
  }

  return res.json();
}
