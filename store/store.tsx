import { configureStore } from "@reduxjs/toolkit";
import groupReducer from "../util/group/groupSlice";
import authReducer from "../util/login/authSlice";
import boardReducer from "../util/board/boardSilce";
import scheduleReducer from "../util/schedule/scheduleSlice";
import chatReducer from "../util/group/chat/chatSlice";
import mypageReducer from "../util/mypage/mypageSlice";
import notificationReducer from "../util/notification/notificationSlice";


export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      mypage: mypageReducer,
      group: groupReducer,
      chat: chatReducer,
      board: boardReducer,
      schedule: scheduleReducer,
      notification: notificationReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
