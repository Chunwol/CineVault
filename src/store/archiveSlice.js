import { createSlice } from '@reduxjs/toolkit';

import {
  getArchivedMovies,
  addArchivedMovie,
  updateArchivedMovie,
  deleteArchivedMovie,
} from '@/utils/localStorage';

const archiveSlice = createSlice({
  name: 'archive',
  initialState: {
    movies: getArchivedMovies(),
  },
  reducers: {
    addMovie(state, action) {
      addArchivedMovie(action.payload);
      state.movies.push(action.payload);
    },
    updateMovie(state, action) {
      updateArchivedMovie(action.payload);
      const index = state.movies.findIndex((movie) => movie.id === action.payload.id);
      if (index !== -1) state.movies[index] = action.payload;
    },
    removeMovie(state, action) {
      deleteArchivedMovie(action.payload);
      state.movies = state.movies.filter((movie) => movie.id !== action.payload);
    },
  },
});

export const { addMovie, updateMovie, removeMovie } = archiveSlice.actions;
export default archiveSlice.reducer;
