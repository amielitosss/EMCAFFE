// src/services/types/sendCloud.types.ts

export interface PickupPoint {
  id: string | number;
  name: string;
  street: string;
  house_number: string;
  address?: string; // combinaison street + house_number
  postal_code: string;
  city: string;
  country: string;
  latitude: string | number;
  longitude: string | number;
  phone?: string;
  email?: string;
  carrier: string;
  opening_hours?: {
    [day: string]: string[];
  };
  distance?: number;
  formatted_opening_times?: any;
}

export interface ParcelItem {
  description: string;
  quantity: number;
  weight: number; // en grammes
  value: number; // en euros
  hs_code?: string;
  origin_country?: string;
  product_id?: string;
  sku?: string;
}

export interface ParcelData {
  order_id: string;
  name: string;
  company_name?: string;
  address: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country: string; // Code ISO 2 lettres (FR, BE, etc.)
  telephone: string;
  email: string;
  
  // Informations du colis
  weight: number; // en grammes
  order_number: string;
  
  // Pour point relais
  is_relay_delivery?: boolean;
  relay_point_id?: string | number;
  
  // Méthode d'expédition
  shipping_method_id?: number;
  
  // Articles
  items: ParcelItem[];
  
  // Options
  request_label?: boolean;
  apply_shipping_rules?: boolean;
  
  // Douane
  customs_invoice_nr?: string;
  customs_shipment_type?: number;
}

export interface ParcelResponse {
  id: number;
  tracking_number: string;
  tracking_url?: string;
  label?: {
    label_printer: string; // URL de l'étiquette imprimante
    normal_printer: string[]; // URLs des étiquettes A4
  };
  status: {
    id: number;
    message: string;
  };
  carrier: {
    code: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  order_number: string;
  to_service_point?: number;
  shipment?: {
    id: number;
    name: string;
  };
}

export interface ShippingLabel {
  parcel_id: number;
  label_url: string; // URL principale de l'étiquette
  label_printer?: string; // Format imprimante thermique
  normal_printer?: string[]; // Format A4
  tracking_number: string;
  tracking_url?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  min_weight: number;
  max_weight: number;
  price: number;
  countries: string[];
  service_point_input: 'none' | 'optional' | 'required';
  properties?: {
    [key: string]: any;
  };
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  message: string;
  location?: string;
}

export interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  status: string;
  events: TrackingEvent[];
  estimated_delivery_date?: string;
  delivered_at?: string;
}

