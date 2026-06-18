import { configureStore } from '@reduxjs/toolkit';

import archiveReducer from './archiveSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    archive:  archiveReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
