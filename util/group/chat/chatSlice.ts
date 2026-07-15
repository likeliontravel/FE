import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MessageType = "TEXT" | "IMAGE";

export interface ChatMessage {
  id: number;
  type: MessageType;
  content?: string;
  name: string;
  profileImageUrl: string | null;
  sendAt: string;
  isMine: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.isConnected = false;
    },
  },
});

export const { addMessage, setMessages, setConnected, clearChat } =
  chatSlice.actions;
export default chatSlice.reducer;
