import { configureStore } from "@reduxjs/toolkit";
import groupReducer from "../util/group/groupSlice";
import authReducer from "../util/login/authSlice";
import boardReducer from "../util/board/boardSilce";
import calendarReducer from "./calendarSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      group: groupReducer,
      board: boardReducer,
      calendar: calendarReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
