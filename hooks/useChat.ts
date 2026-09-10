import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setMessages,
  ChatMessage,
  clearChat,
  setConnected,
  updateLatestMessage,
} from "../util/group/chat/chatSlice";
import { api } from "../util/api";
import { RootState } from "../store/store";

export const useChat = (groupName: string) => {
  const dispatch = useDispatch();
  const clientRef = useRef<Client | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);
  const myName = user?.name || "";

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!groupName || !user) return;

    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/chat/${groupName}/messages`);

        if (res.status === 204) {
          dispatch(setMessages([]));
          setHasMore(false);
          return;
        }

        if (res.data && res.data.success) {
          const { senderProfiles, messages: rawMessages } = res.data.data;

          if (rawMessages.length < 20) setHasMore(false);

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

            dispatch(
              updateLatestMessage({
                groupName: groupName,
                latestMessage: msg.content,
                sendAt: msg.sendAt,
                type: msg.type,
              }),
            );
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

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestMessageId = messages[0].id;

    try {
      const res = await api.get(
        `/chat/${groupName}/messages/prev?lastMessageId=${oldestMessageId}`,
      );

      if (res.status === 204) {
        setHasMore(false);
        return;
      }

      if (res.data && res.data.success) {
        const { senderProfiles, messages: rawMessages } = res.data.data;

        if (rawMessages.length === 0) {
          setHasMore(false);
          return;
        }

        const olderMessages = rawMessages.map((msg: any) => {
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

        dispatch(setMessages([...olderMessages, ...messages]));
      }
    } catch (err) {
      console.error("이전 메시지 불러오기 실패:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { sendMessage, loadMoreMessages };
};
