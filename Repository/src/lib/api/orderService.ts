// src/lib/api/orderService.ts

import { API_BASE_URL } from './config';
import type { Order } from './types/order.types';

export const orderService = {
  /**
   * Récupère toutes les commandes de l'utilisateur connecté
   */
  async getMyOrders(): Promise<Order[]> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la récupération des commandes');
    }

    return data.data;
  },

  /**
   * Récupère une commande spécifique par son ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la récupération de la commande');
    }

    return data.data;
  },

  /**
   * Crée une nouvelle commande
   */
  async createOrder(orderData: {
    id_user_account: string;
    items: Array<{ id_product: string; quantity: number }>;
    delivery_address: string;
    delivery_city: string;
    delivery_postal_code: string;
    delivery_phone: string;
    email: string;
  }): Promise<Order> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la création de la commande');
    }

    return data.data;
  },
};
