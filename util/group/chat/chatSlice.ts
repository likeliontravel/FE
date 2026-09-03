import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import { RootState } from "../../../store/store";

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

export interface ChatRoom {
  groupName: string;
  latestMessage: string;
  sendAt: string;
  type: MessageType;
}

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  chatList: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  searchResults: ChatMessage[];
  isSearching: boolean;
  isSearchLoading: boolean;
  isImageUploading: boolean;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  chatList: [],
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  isSearchLoading: false,
  isImageUploading: false,
};

const sortChatListByTime = (list: ChatRoom[]) => {
  return list.sort((a, b) => {
    const timeA = a.sendAt ? new Date(a.sendAt).getTime() : 0;
    const timeB = b.sendAt ? new Date(b.sendAt).getTime() : 0;
    return timeB - timeA;
  });
};

const mapMessages = (
  rawMessages: any[],
  senderProfiles: any,
  myName: string,
) => {
  return rawMessages.map((msg: any) => {
    const identifier = msg.senderIdentifier || msg.senderId;
    const profile = senderProfiles[String(identifier)];
    const senderName = profile?.name || "알 수 없는 사용자";

    return {
      ...msg,
      name: senderName,
      profileImageUrl: profile?.profileImageUrl || "",
      isMine: senderName === myName,
    };
  });
};

export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/chat/user-groups/with-latest");
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return rejectWithValue("데이터 구조가 올바르지 않습니다.");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "채팅방 목록을 불러오지 못했습니다.",
      );
    }
  },
);

export const searchMessages = createAsyncThunk(
  "chat/searchMessages",
  async (
    {
      groupName,
      keyword,
      lastMessageId,
      direction = "BEFORE",
    }: {
      groupName: string;
      keyword: string;
      lastMessageId?: number;
      direction?: string;
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const encodedGroup = encodeURIComponent(groupName);
      const encodedKeyword = encodeURIComponent(keyword.trim());

      let url = `/chat/${encodedGroup}/messages/search?keyword=${encodedKeyword}`;
      if (lastMessageId) url += `&lastMessageId=${lastMessageId}`;
      if (direction) url += `&direction=${direction}`;

      const res = await api.get(url);

      if (res.status === 204) return [];

      if (res.data && res.data.success) {
        const { senderProfiles, messages: rawMessages } = res.data.data;
        const state = getState() as RootState;
        const myName = state.auth.user?.name || "";

        return mapMessages(rawMessages, senderProfiles, myName);
      }
      return rejectWithValue("검색 데이터가 올바르지 않습니다.");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "검색 중 오류 발생",
      );
    }
  },
);

export const jumpToMessage = createAsyncThunk(
  "chat/jumpToMessage",
  async (
    { groupName, lastMessageId }: { groupName: string; lastMessageId: number },
    { rejectWithValue, getState },
  ) => {
    try {
      const encodedGroup = encodeURIComponent(groupName);
      const url = `/chat/${encodedGroup}/messages/search?lastMessageId=${lastMessageId}&direction=BOTH`;

      const res = await api.get(url);

      if (res.status === 204) return [];

      if (res.data && res.data.success) {
        const { senderProfiles, messages: rawMessages } = res.data.data;
        const state = getState() as RootState;
        const myName = state.auth.user?.name || "";

        return mapMessages(rawMessages, senderProfiles, myName);
      }
      return rejectWithValue("점프 데이터가 올바르지 않습니다.");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "메시지 이동 중 오류 발생",
      );
    }
  },
);

export const uploadImageMessage = createAsyncThunk(
  "chat/uploadImageMessage",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post("/chat/image/upload", formData);

      if (res.data && res.data.success) {
        return res.data.data as string;
      }
      return rejectWithValue("이미지 업로드 실패: 올바르지 않은 데이터");
    } catch (err: any) {
      if (err.response?.status === 413) {
        return rejectWithValue("사진 용량이 너무 커서 전송할 수 없습니다.");
      }
      return rejectWithValue(
        err.response?.data?.message || "이미지 업로드 중 오류가 발생했습니다.",
      );
    }
  },
);

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
    updateLatestMessage: (
      state,
      action: PayloadAction<{
        groupName: string;
        latestMessage: string;
        sendAt: string;
        type: MessageType;
      }>,
    ) => {
      const { groupName, latestMessage, sendAt, type } = action.payload;
      const targetIndex = state.chatList.findIndex(
        (chat) => chat.groupName === groupName,
      );

      if (targetIndex !== -1) {
        state.chatList[targetIndex].latestMessage = latestMessage;
        state.chatList[targetIndex].sendAt = sendAt;
        state.chatList[targetIndex].type = type;

        sortChatListByTime(state.chatList);
      }
    },
    clearSearch: (state) => {
      state.isSearching = false;
      state.searchResults = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatList = sortChatListByTime(action.payload);
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(searchMessages.pending, (state) => {
        state.isSearchLoading = true;
        state.isSearching = true;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.isSearchLoading = false;
        const { lastMessageId, direction } = action.meta.arg;

        if (lastMessageId && direction === "BEFORE") {
          state.searchResults = [...state.searchResults, ...action.payload];
        } else {
          state.searchResults = action.payload;
        }
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.isSearchLoading = false;
        state.error = action.payload as string;
      })
      .addCase(jumpToMessage.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(uploadImageMessage.pending, (state) => {
        state.isImageUploading = true;
      })
      .addCase(uploadImageMessage.fulfilled, (state) => {
        state.isImageUploading = false;
      })
      .addCase(uploadImageMessage.rejected, (state, action) => {
        state.isImageUploading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addMessage,
  setMessages,
  setConnected,
  clearChat,
  updateLatestMessage,
  clearSearch,
} = chatSlice.actions;
export default chatSlice.reducer;
