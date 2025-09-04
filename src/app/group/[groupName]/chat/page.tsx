"use client";

import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { useParams, useSearchParams } from "next/navigation";
import style from "../../../../../styles/group/chat.module.scss";
import Image from "next/image";

type MessageType = "TEXT" | "IMAGE";
type ChatMessage = {
  id: string;
  type: MessageType;
  content?: string;
  latestMessage?: string;
  name: string;
  profileImageUrl: string;
  sendAt: string;
  isMine?: boolean;
};

const DUMMY_MESSAGES: ChatMessage[] = [
  {
    id: "m-001",
    type: "TEXT",
    content: "안녕하세요! 프로젝트 방에 오신 걸 환영합니다 🙌",
    name: "운영자",
    profileImageUrl: "/imgs/avatar-admin.png",
    sendAt: "2024-12-10 09:32",
  },
  {
    id: "m-002",
    type: "TEXT",
    content: "오늘 회의 안건 정리된 문서 공유드릴게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:33",
    isMine: true,
  },
  {
    id: "m-003",
    type: "IMAGE",
    latestMessage: "/imgs/sample-wireframe.png",
    name: "디자이너A",
    profileImageUrl: "/imgs/avatar-designer.png",
    sendAt: "2024-12-10 09:35",
  },
  {
    id: "m-004",
    type: "TEXT",
    content: "와이어프레임 좋네요! 버튼 섀도우만 조금 약하게 가보면 어떨까요?",
    name: "개발자B",
    profileImageUrl: "/imgs/avatar-dev.png",
    sendAt: "2024-12-10 09:36",
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
  {
    id: "m-005",
    type: "TEXT",
    content: "좋아요. 컬러 토큰도 같이 정리할게요.",
    name: "a",
    profileImageUrl: "/imgs/avatar-me.png",
    sendAt: "2024-12-10 09:38",
    isMine: true,
  },
];

export default function WebSocketChatClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const groupName =
    typeof params.groupName === "string" ? params.groupName : "";
  const groupDescription = searchParams.get("groupDescription") ?? "";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const stompClientRef = useRef<Client | null>(null);

  const getTokens = () => {
    if (typeof window === "undefined")
      return { accessToken: "", refreshToken: "" };
    return {
      accessToken: localStorage.getItem("accessToken") || "",
      refreshToken: localStorage.getItem("refreshToken") || "",
    };
  };

  useEffect(() => {
    if (!groupName) return;

    setMessages(DUMMY_MESSAGES);
    return;

    const { accessToken, refreshToken } = getTokens();
    const queryString = `?accessToken=${encodeURIComponent(
      accessToken
    )}&refreshToken=${encodeURIComponent(
      refreshToken
    )}&groupName=${encodeURIComponent(groupName)}`;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("https://localhost:8080/ws" + queryString),
      reconnectDelay: 3000, // 끊기면 3초 후 재연결
      onConnect: () => {
        const sub = client.subscribe(
          `/sub/chat/${groupName}`,
          (frame: IMessage) => {
            try {
              const msg = JSON.parse(frame.body);
              setMessages((prev) => [...prev, msg]);
            } catch (e) {
              console.error("메시지 파싱 실패:", e);
            }
          }
        );
        (client as any)._chatSubscription = sub;
      },
      onWebSocketClose: () => {},
      onStompError: (frame) => {
        console.error("STOMP 오류:", frame.headers["message"], frame.body);
        alert(
          "WebSocket 연결 실패: " +
            (frame.headers["message"] || "알 수 없는 오류")
        );
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      try {
        const c = stompClientRef.current;
        if (c) {
          const sub = (c as any)._chatSubscription;
          if (sub && typeof sub.unsubscribe === "function") {
            sub.unsubscribe();
          }
          if (c.active) {
            c.deactivate();
          }
        }
      } catch (e) {
        console.warn("WebSocket cleanup 중 오류:", e);
      } finally {
        stompClientRef.current = null;
      }
    };
  }, [groupName]);

  const sendTextMessage = () => {
    const client = stompClientRef.current;
    if (!client || !client.active) return;
    if (!message.trim()) return;

    client.publish({
      destination: `/pub/chat/${groupName}`,
      body: JSON.stringify({ content: message.trim(), type: "TEXT" }),
    });
    setMessage("");
  };

  return (
    <div className={style.chatbody}>
      <div className={style.chatcontainer}>
        <div className={style.chatheader}>
          <h2>{decodeURIComponent(groupName)}</h2>
          <p>{decodeURIComponent(groupDescription)}</p>
        </div>
        <div className={style.chatmessages}>
          <div className={style.date}>
            <p>2024.12.10 화요일</p>
          </div>
          <div className={style.messages_box}>
            {messages.map((msg, idx) => (
              <div className={style.chatmessage} key={idx}>
                {msg.isMine === true ? (
                  <div className={style.mymessage}>
                    {msg.type === "TEXT" ? (
                      <div className={style.text_box}>
                        <p className={style.my_text}>{msg.content}</p>
                      </div>
                    ) : (
                      <div>
                        <img
                          className={style.img}
                          src={msg.latestMessage}
                          alt="image"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={style.non_my_message}>
                    {msg.type === "TEXT" ? (
                      <div className={style.text_box}>
                        <div className={style.img_box}>
                          <img src={msg.profileImageUrl} alt="프로필 이미지" />
                          <h4>{msg.name}</h4>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    ) : (
                      <div className={style.text_box}>
                        <div className={style.img_box}>
                          <img src={msg.profileImageUrl} alt="프로필 이미지" />
                          <h4>{msg.name}</h4>
                        </div>
                        <img
                          className={style.img}
                          src={msg.latestMessage}
                          alt="image"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={style.inputContainer}>
            <input
              className={style.inputContent}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
              size={60}
            />
            <Image
              src="/imgs/push.png"
              alt="Send"
              width={50}
              height={50}
              onClick={sendTextMessage}
            />
          </div>
        </div>
      </div>

      <div className={style.chatbox}>
        <div className={style.searchbox}>
          <input type="text" placeholder="찾으시는 정보를 입력해주세요..." />
          <img src="/imgs/search.png" alt="search" />
        </div>
        <div className={style.chatlist}></div>
      </div>
    </div>
  );
}
