import type { PickupPoint } from "./types/sendCloud.types";


const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export const sendcloudService = {
  async getPickupPoints(postalCode: string, city?: string): Promise<PickupPoint[]> {
    const params = new URLSearchParams({ postal_code: postalCode, country: 'FR' });
    if (city) params.append('city', city);

    const res = await fetch(`${API_BASE}/sendcloud/service-points?${params.toString()}`);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const data: PickupPoint[] = await res.json();
    return data;
  },
};
