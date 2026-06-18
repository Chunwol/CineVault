import { createSlice } from '@reduxjs/toolkit';

import { getWishlist, addToWishlist, removeFromWishlist } from '@/utils/localStorage';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    movies: getWishlist(),
  },
  reducers: {
    toggleWishlist(state, action) {
      const movie = action.payload;
      const exists = state.movies.some((m) => m.id === movie.id);
      if (exists) {
        removeFromWishlist(movie.id);
        state.movies = state.movies.filter((m) => m.id !== movie.id);
      } else {
        addToWishlist(movie);
        state.movies.push(movie);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
