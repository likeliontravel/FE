import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setMessages,
  ChatMessage,
  clearChat,
  setConnected,
} from "../util/group/chat/chatSlice";
import { api } from "../util/api";
import { RootState } from "../store/store";

export const useChat = (groupName: string) => {
  const dispatch = useDispatch();
  const clientRef = useRef<Client | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const myName = user?.name || "";

  useEffect(() => {
    if (!groupName || !user) return;

    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/chat/history/${groupName}`);

        if (res.data.success) {
          const historyMessages = res.data.data.map((msg: any) => ({
            ...msg,
            isMine: msg.name === myName,
          }));
          dispatch(setMessages(historyMessages));
        }
      } catch (err) {
        console.error("채팅 내역 불러오기 실패:", err);
      }
    };

    fetchChatHistory();

    const queryString = `?groupName=${encodeURIComponent(groupName)}`;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("https://api.toleave.cloud/ws" + queryString, null, {
          transports: ["xhr-streaming", "xhr-polling"],
          withCredentials: true,
        } as any),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket Connected!");
        dispatch(setConnected(true));

        client.subscribe(`/sub/chat/${groupName}`, (frame: IMessage) => {
          try {
            const msg = JSON.parse(frame.body);

            const newMsg: ChatMessage = {
              ...msg,
              isMine: msg.name === myName,
            };

            dispatch(addMessage(newMsg));
          } catch (e) {
            console.error("메시지 파싱 에러:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error(
          "Stomp Error Details:",
          frame.headers["message"],
          frame.body,
        );
        dispatch(setConnected(false));
      },
      onWebSocketClose: () => {
        console.log("WebSocket Closed");
        dispatch(setConnected(false));
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
      dispatch(clearChat());
    };
  }, [groupName, dispatch, myName, user]);

  const sendMessage = (content: string, type: "TEXT" | "IMAGE" = "TEXT") => {
    const client = clientRef.current;
    if (client && client.active && content.trim()) {
      client.publish({
        destination: `/pub/chat/${groupName}`,
        body: JSON.stringify({ content, type }),
      });
      return true;
    }
    return false;
  };

  return { sendMessage };
};
