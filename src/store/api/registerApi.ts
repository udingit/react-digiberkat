// @/src/store/api/registerApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const registerApi = createApi({
  reducerPath: 'registerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://digiberkat-production.up.railway.app/api/v1/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      // Ubah 'email' menjadi 'username' jika email memang digunakan sebagai username
      query: (credentials: {
        username: string; // Seharusnya ini yang dikirim, isinya bisa email
        password: string;
      }) => ({
        url: 'register/user',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: () => {
        return { success: true };
      },
      transformErrorResponse: (response: any) => {
        if (response.data && typeof response.data === 'object') {
          if ('error' in response.data) {
            return { error: response.data.error };
          }
          if ('message' in response.data) {
            return { error: response.data.message };
          }
        }
        return { error: 'Terjadi kesalahan saat registrasi' };
      },
    }),
  }),
});

export const { useRegisterUserMutation } = registerApi;