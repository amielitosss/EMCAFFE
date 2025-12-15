export interface OrderItem {
  id_order_item: string;
  id_order: string;
  id_product: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: {
    id_product: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface Order {
  id_order: string;
  id_user_account: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  orderItems: OrderItem[];
}
