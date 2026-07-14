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
        const res = await api.get(`/chat/${groupName}/messages`);

        if (res.status === 204) {
          dispatch(setMessages([]));
          return;
        }

        if (res.data && res.data.success) {
          const { senderProfiles, messages: rawMessages } = res.data.data;

          const historyMessages = rawMessages.map((msg: any) => {
            const profile = senderProfiles[String(msg.senderId)];
            const senderName = profile?.name || "알 수 없는 사용자";
            const profileImageUrl = profile?.profileImageUrl || "";

            return {
              ...msg,
              name: senderName,
              profileImageUrl: profileImageUrl,
              isMine: senderName === myName,
            };
          });
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

            const isMine = Number(msg.senderId) === Number(user?.id);

            const newMsg: ChatMessage = {
              ...msg,
              isMine: isMine,
              name: isMine ? user?.name : msg.name || "상대방",
              profileImageUrl: isMine
                ? user?.profileImageUrl
                : msg.profileImageUrl || "",
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
