// // src/store/api/productsApi.ts
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import type { Product } from '@/types/product';
// import type { RecommendedProduct } from '@/types/recommendation';

// // Definisi tipe untuk struktur respons mentah dari API AI Anda
// interface RawAIResponse {
//   data: RecommendedProduct[];
//   message: string;
// }

// export const productsApi = createApi({
//   reducerPath: 'productsApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://digiberkat-production.up.railway.app/api/v1/', // <-- Base URL untuk API backend utama Anda
//     prepareHeaders: (headers, { getState }) => { 
//       const token = (getState() as any).auth.token;
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Product', 'Recommendation'],
//   endpoints: (builder) => ({
//     getProducts: builder.query<Product[], void>({
//       query: () => 'products',
//       transformResponse: (response: { data: Product[] }) => response.data,
//       providesTags: ['Product'],
//     }),
//     getProductById: builder.query<Product, number>({
//       query: (id) => `products/id/${id}`,
//       transformResponse: (response: { data: Product }) => response.data,
//       providesTags: (result, error, id) => [{ type: 'Product', id }],
//     }),

//     // NEW: AI Recommendation Endpoint
//     getRecommendedProducts: builder.mutation<
//       RecommendedProduct[], // ✅ Tipe ini adalah output respons SETELAH transformResponse
//       { userQuery: string; products: Product[] } // Payload yang dikirim ke API
//     >({
//       query: ({ userQuery, products }) => ({
//         url: 'https://digiberkat-production.up.railway.app/api/v1/recommend', // <--- PASTE URL NGROK ANDA DI SINI
//         method: 'POST',
//         body: { userQuery, products },
//       }),
//       // ✅ Gunakan transformResponse untuk mengekstrak array 'data'
//       // Ini akan memastikan bahwa 'action.payload' di extraReducers adalah RecommendedProduct[]
//       transformResponse: (response: RawAIResponse) => response.data,
//       // Karena data akan disimpan ke slice terpisah, kita tidak perlu providesTags/invalidatesTags di sini.
//       // Caching mutasi bawaan RTK Query hanya men-cache hasil terakhir.
//     }),
//   }),
// });

// export const {
//   useGetProductsQuery,
//   useGetProductByIdQuery,
//   useLazyGetProductsQuery,
//   useGetRecommendedProductsMutation, // Export the new mutation hook
// } = productsApi;
// src/store/api/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product } from '@/types/product';
import type { RecommendedProduct } from '@/types/recommendation';
import { RootState } from '@/src/store/store'; // Import RootState untuk tipe yang lebih baik

// Definisi tipe untuk struktur respons mentah dari API AI Anda
interface RawAIResponse {
  data: RecommendedProduct[];
  message: string;
}

// Definisi tipe untuk payload permintaan restock
interface RestockRequestPayload {
  product_id: number;
  product_variant_id: number;
  message: string;
}

// Definisi tipe untuk respons sukses/gagal restock
// Kita akan menggunakan satu tipe respons yang berisi pesan
interface RestockResponse {
  message: string;
}

// Definisikan baseQuery di luar createApi agar bisa digunakan di queryFn
// Ini memastikan prepareHeaders dengan logika token dijalankan untuk semua permintaan
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: 'https://digiberkat-production.up.railway.app/api/v1/', // Base URL untuk API backend utama Anda
  prepareHeaders: (headers, { getState }) => {
    // Mengambil token dari slice 'auth' di Redux state
    const token = (getState() as RootState).auth.token;
    if (token) {
      // Menambahkan header Authorization jika token ada
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithAuth, // Gunakan baseQuery yang sudah didefinisikan
  tagTypes: ['Product', 'Recommendation'],
  endpoints: (builder) => ({
    // Endpoint untuk mendapatkan semua produk
    getProducts: builder.query<Product[], void>({
      query: () => 'products',
      transformResponse: (response: { data: Product[] }) => response.data,
      providesTags: ['Product'],
    }),
    // Endpoint untuk mendapatkan produk berdasarkan ID
    getProductById: builder.query<Product, number>({
      query: (id) => `products/id/${id}`,
      transformResponse: (response: { data: Product }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Endpoint untuk rekomendasi AI (mutation)
    getRecommendedProducts: builder.mutation<
      RecommendedProduct[], // Tipe output setelah transformResponse
      { userQuery: string; products: Product[] } // Payload yang dikirim ke API
    >({
      query: ({ userQuery, products }) => ({
        url: 'recommend', // URL relatif karena baseUrl sudah diatur
        method: 'POST',
        body: { userQuery, products },
      }),
      // Menggunakan transformResponse untuk mengekstrak array 'data' dari respons mentah
      transformResponse: (response: RawAIResponse) => response.data,
    }),

    // NEW: Mutation untuk permintaan restock produk
    restockProduct: builder.mutation<
      RestockResponse, // Tipe respons yang diharapkan (hanya pesan)
      RestockRequestPayload // Tipe payload untuk permintaan restock
    >({
      // Menggunakan queryFn untuk kontrol penuh atas logika permintaan,
      // termasuk validasi pre-flight dan penanganan pesan kustom.
      queryFn: async (arg, api) => {
        const state = api.getState() as RootState;
        const token = state.auth.token;
        const userId = state.auth.userId;

        // Validasi: Periksa apakah token dan userId tersedia di state Redux
        if (!token || userId === null) {
          // Jika tidak ada token atau userId, kembalikan error dengan pesan kustom.
          // Format error harus sesuai dengan FetchBaseQueryError untuk ditangani RTK Query.
          return {
            error: {
              status: 401, // Unauthorized
              data: { message: 'Mohon login dulu untuk mengirim permintaan restock produk.' },
            },
          };
        }

        // Siapkan body permintaan dengan user_id yang diambil dari state Redux
        const body = {
          user_id: userId,
          product_id: arg.product_id,
          product_variant_id: arg.product_variant_id,
          message: arg.message,
        };

        try {
          // Panggil baseQuery yang sudah dikonfigurasi (`baseQueryWithAuth`).
          // Ini akan secara otomatis menambahkan header Authorization.
          // FIX: Menambahkan argumen ketiga (extraOptions) sebagai objek kosong {}
          const result = await baseQueryWithAuth(
            {
              url: 'restock-requests', // Endpoint spesifik untuk restock
              method: 'POST',
              body: body,
            },
            api, // Meneruskan objek 'api' yang berisi getState, dispatch, dll.
            {} // Argumen ketiga: extraOptions (objek kosong)
          );

          // Periksa apakah ada error dari respons API (misal: status 4xx atau 5xx)
          if (result.error) {
            // Jika ada error dari API, kembalikan error dengan pesan kustom.
            return {
              error: {
                status: (result.error as any).status || 500, // Ambil status jika ada, default 500
                data: { message: 'Maaf, ada masalah koneksi atau server sedang tidak stabil. Coba lagi nanti.' },
              },
            };
          }

          // Jika permintaan berhasil, kembalikan data sukses dengan pesan kustom.
          return { data: { message: 'Terima kasih, kami akan meninjau permintaan Anda.' } };

        } catch (error) {
          // Tangani error jaringan atau error tak terduga lainnya yang terjadi sebelum respons API
          return {
            error: {
              status: 'FETCH_ERROR', // Status kustom untuk error jaringan
              data: { message: 'Maaf, ada masalah koneksi atau server sedang tidak stabil. Coba lagi nanti.' },
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductsQuery,
  useGetRecommendedProductsMutation,
  useRestockProductMutation, // Export hook baru untuk restockProduct
} = productsApi;
