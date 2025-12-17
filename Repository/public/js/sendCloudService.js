// public/js/sendcloudService.js

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export const sendcloudService = {

  // 📍 POINTS RELAIS
  getPickupPoints: async function(postalCode, city, carrier) {
    const params = new URLSearchParams({
      postal_code: postalCode,
      country: 'FR'
    });

    if (city) params.append('city', city);
    if (carrier) params.append('carrier', carrier);

    const res = await fetch(`${API_BASE}/sendcloud/service-points?${params.toString()}`);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const json = await res.json();
    return json.data;
  },

  // 📦 COLIS
  createParcel: async function(parcelData, token) {
    const res = await fetch(`${API_BASE}/sendcloud/parcels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(parcelData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur création colis');
    }

    const json = await res.json();
    return json.data;
  },

  // 🏷️ ÉTIQUETTES
  getLabel: async function(parcelId, token) {
    const res = await fetch(`${API_BASE}/sendcloud/parcels/${parcelId}/label`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  downloadLabel: async function(parcelId, token) {
    const label = await this.getLabel(parcelId, token);
    if (!label.label_url) throw new Error('Étiquette indisponible');
    window.open(label.label_url, '_blank');
  },

  // 🚚 MÉTHODES D’EXPÉDITION
  getShippingMethods: async function(token) {
    const res = await fetch(`${API_BASE}/sendcloud/shipping-methods`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  // 🗑️ ANNULATION
  cancelParcel: async function(parcelId, token) {
    const res = await fetch(`${API_BASE}/sendcloud/parcels/${parcelId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
  }
};
