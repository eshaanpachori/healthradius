import { configureStore } from '@reduxjs/toolkit';
import { api } from './api.js';
import authReducer from '../features/auth/authSlice.js';
import comparisonReducer from '../features/comparison/comparisonSlice.js';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    comparison: comparisonReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});
