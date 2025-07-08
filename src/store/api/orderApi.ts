// @/src/store/api/orderApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Response interface for cancel order (assuming a simple success message)
interface CancelOrderResponse {
  message: string;
}

interface CreateOrderResponse {
  expired_at: string;
  message: string;
  order_id: number;
}

interface OrderItem {
  order_item_id: number;
  price_at_purchase: number;
  product_id: number;
  product_name: string;
  quantity: number;
  thumbnail: string;
  variant: string | null;
}

interface Order {
  created_at: string;
  id: number;
  status: string;
  total_price: number;
  updated_at: string;
  user_id: number;
}

interface OrderWithSampleItem {
  order: Order;
  sample_item: OrderItem;
}

interface OrdersResponse {
  data: OrderWithSampleItem[];
  message: string;
}

// --- NEW INTERFACES FOR ORDER DETAIL ---
interface ProductVariant {
  id: number;
  name: string;
  price: number;
  is_discounted: boolean;
  discount_price: number | null;
  stock: number;
}

interface OrderDetailItem {
  id: number;
  order_id: number;
  product_id: number;
  product_variant_id: number | null;
  name: string;
  thumbnails: string[];
  quantity: number;
  price: number;
  price_at_purchase: number;
  total_price: number;
  variants?: ProductVariant[]; // Optional, only if product has variants
}

interface OrderDetailResponse {
  created_at: string;
  data: OrderDetailItem[];
  message: string;
  status: string;
  total_order_price: number;
}
// --- END NEW INTERFACES ---

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://digiberkat-production.up.railway.app/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'OrderDetail'], // Tambahkan 'OrderDetail' ke tagTypes
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, void>({
      query: () => ({
        url: 'orders',
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
      transformErrorResponse: (response: { status: number; data?: { message?: string } }) => {
        return {
          status: response.status,
          message: response.data?.message || 'Gagal membuat order',
        };
      },
    }),
    getMyOrders: builder.query<OrdersResponse, void>({
      query: () => 'orders/my',
      providesTags: ['Order'],
      transformErrorResponse: (response: { status: number; data?: { message?: string } }) => {
        return {
          status: response.status,
          message: response.data?.message || 'Gagal mengambil data order',
        };
      },
    }),
    // New mutation for canceling an order
    cancelOrder: builder.mutation<CancelOrderResponse, number>({ // 'number' as the type for order_id
      query: (id) => ({
        url: `orders/${id}/cancel`, // Dynamic ID in the URL
        method: 'PUT', // Use PUT method as specified
      }),
      invalidatesTags: ['Order'], // Invalidate 'Order' tag to refetch getMyOrders after cancellation
      transformErrorResponse: (response: { status: number; data?: { message?: string } }) => {
        return {
          status: response.status,
          message: response.data?.message || 'Gagal membatalkan order',
        };
      },
    }),
    // --- NEW ENDPOINT FOR ORDER DETAIL ---
    getOrderDetail: builder.query<OrderDetailResponse, number>({
      query: (id) => `orders/${id}`, // Endpoint dengan ID order
      providesTags: (result, error, id) => [{ type: 'OrderDetail', id }], // Memberikan tag untuk caching
      transformErrorResponse: (response: { status: number; data?: { message?: string } }) => {
        return {
          status: response.status,
          message: response.data?.message || 'Gagal mengambil detail order',
        };
      },
    }),
    // --- END NEW ENDPOINT ---
  }),
});

// Export the new hook along with existing ones
export const { useCreateOrderMutation, useGetMyOrdersQuery, useCancelOrderMutation, useGetOrderDetailQuery } = orderApi;
