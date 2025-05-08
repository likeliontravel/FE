import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../util/login/authSlice';
import boardReducer from '../util/board/boardSilce';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
