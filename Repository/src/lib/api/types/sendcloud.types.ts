export interface PickupPoint {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  carrier?: string;
  latitude: number;   // ou lat si tu préfères
  longitude: number;  // ou lng
}
