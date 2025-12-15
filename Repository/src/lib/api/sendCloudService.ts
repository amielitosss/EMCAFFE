// src/services/sendcloud.service.ts
import type { PickupPoint, ParcelData, ParcelResponse, ShippingLabel, ShippingMethod } from "./types/sendCloud.types";

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

type ApiResponse<T> = {
  success: boolean;
  count?: number;
  data: T;
};

export const sendcloudService = {

  // =====================================
  // 📍 POINTS RELAIS
  // =====================================
  async getPickupPoints(
    postalCode: string,
    city?: string,
    carrier?: string
  ): Promise<PickupPoint[]> {

    const params = new URLSearchParams({
      postal_code: postalCode,
      country: 'FR'
    });

    if (city) params.append('city', city);
    if (carrier) params.append('carrier', carrier);

    const res = await fetch(
      `${API_BASE}/sendcloud/service-points?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const json: ApiResponse<PickupPoint[]> = await res.json();
    return json.data;
  },

  // =====================================
  // 📦 COLIS
  // =====================================
  async createParcel(
    parcelData: ParcelData,
    token: string
  ): Promise<ParcelResponse> {

    const res = await fetch(`${API_BASE}/sendcloud/parcels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parcelData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur création colis');
    }

    const json: ApiResponse<ParcelResponse> = await res.json();
    return json.data;
  },

  // =====================================
  // 🏷️ ÉTIQUETTES
  // =====================================
  async getLabel(
    parcelId: number,
    token: string
  ): Promise<ShippingLabel> {

    const res = await fetch(
      `${API_BASE}/sendcloud/parcels/${parcelId}/label`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const json: ApiResponse<ShippingLabel> = await res.json();
    return json.data;
  },

  async downloadLabel(parcelId: number, token: string): Promise<void> {
    const label = await this.getLabel(parcelId, token);

    if (!label.label_url) {
      throw new Error('Étiquette indisponible');
    }

    window.open(label.label_url, '_blank');
  },

  // =====================================
  // 🚚 MÉTHODES D’EXPÉDITION
  // =====================================
  async getShippingMethods(token: string): Promise<ShippingMethod[]> {
    const res = await fetch(
      `${API_BASE}/sendcloud/shipping-methods`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const json: ApiResponse<ShippingMethod[]> = await res.json();
    return json.data;
  },

  // =====================================
  // 🗑️ ANNULATION
  // =====================================
  async cancelParcel(parcelId: number, token: string): Promise<void> {
    const res = await fetch(
      `${API_BASE}/sendcloud/parcels/${parcelId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }
  },
};
