import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  pendingFavoriteAction: null // stores hospital details if guest tried to favorite
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.pendingFavoriteAction = null;
    },
    setPendingFavorite: (state, action) => {
      state.pendingFavoriteAction = action.payload;
    },
    clearPendingFavorite: (state) => {
      state.pendingFavoriteAction = null;
    }
  }
});

export const { setCredentials, logOut, setPendingFavorite, clearPendingFavorite } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectPendingFavorite = (state) => state.auth.pendingFavoriteAction;
