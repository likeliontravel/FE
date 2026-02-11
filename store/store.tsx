import { configureStore } from "@reduxjs/toolkit";
import groupReducer from "../util/group/groupSlice";
import authReducer from "../util/login/authSlice";
import boardReducer from "../util/board/boardSilce";
import scheduleReducer from "../util/schedule/scheduleSilce";
import calendarReducer from "./calendarSlice";
import chatReducer from "../util/group/chat/chatSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      group: groupReducer,
      chat: chatReducer,
      board: boardReducer,
      calendar: calendarReducer,
      schedule: scheduleReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
