import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MessageType = "TEXT" | "IMAGE";

export interface ChatMessage {
  id: string;
  type: MessageType;
  content?: string;
  latestMessage?: string;
  name: string;
  profileImageUrl: string;
  sendAt: string;
  isMine?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [],
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
  },
});

export const { addMessage, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
