import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../util/login/authSlice";
import boardReducer from "../util/board/boardSilce";
import calendarReducer from "./calendarSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    calendar: calendarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
