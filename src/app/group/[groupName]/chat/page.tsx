"use client";

import { useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useParams, useSearchParams } from "next/navigation";
import style from "../../../../../styles/group/chat.module.scss";

export default function WebSocketChatClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const groupName =
    typeof params.groupName === "string" ? params.groupName : "";
  const groupDescription = searchParams.get("groupDescription");
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || ""
      : "";
  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken") || ""
      : "";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const stompClientRef = useRef<Client | null>(null);

  const connectAndSubscribe = () => {
    const queryString = `?accessToken=${encodeURIComponent(
      accessToken
    )}&refreshToken=${encodeURIComponent(
      refreshToken
    )}&groupName=${encodeURIComponent(groupName)}`;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("https://localhost:8080/ws" + queryString),
      connectHeaders: {},
      debug: () => {},
      onConnect: (frame) => {
        client.subscribe(`/sub/chat/${groupName}`, (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onStompError: (frame) => {
        alert("WebSocket 연결 실패: " + frame.headers["message"]);
        console.error(frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  const sendTextMessage = () => {
    if (!stompClientRef.current) return;
    stompClientRef.current.publish({
      destination: `/pub/chat/${groupName}`,
      body: JSON.stringify({ content: message, type: "TEXT" }),
    });
    setMessage("");
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("groupName", groupName);

    try {
      const response = await fetch("https://localhost:8080/chat/image/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Refresh-Token": refreshToken,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("서버 응답 오류");

      const data = await response.json();
      setImageUrl(data.data);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  const sendImage = () => {
    if (!stompClientRef.current) return;
    stompClientRef.current.publish({
      destination: `/pub/chat/${groupName}`,
      body: JSON.stringify({ content: imageUrl, type: "IMAGE" }),
    });
    setImageUrl("");
  };

  return (
    <div className={style.chatbody}>
      <div className={style.chatcontainer}>
        <div className={style.chatheader}>
          <h2>{decodeURIComponent(groupName)}</h2>
          <p>{decodeURIComponent(groupDescription ?? "")}</p>
        </div>
        <div>
          <button onClick={connectAndSubscribe}>🔌 Connect & Subscribe</button>
        </div>

        <hr />

        <h3>💬 메시지 전송</h3>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          size={60}
        />
        <button onClick={sendTextMessage}>📤 전송</button>

        <br />
        <br />

        <input type="file" onChange={uploadImage} />
        {imageUrl && (
          <div>
            <p>📸 미리보기</p>
            <img src={imageUrl} width={200} alt="preview" />
            <br />
            <button onClick={sendImage}>📤 이미지 전송</button>
          </div>
        )}

        <hr />
        <h3>📥 수신 메시지</h3>
        <div>
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === "TEXT" ? (
                <p>
                  <strong>{msg.senderIdentifier}</strong>: {msg.content}
                </p>
              ) : (
                <p>
                  <strong>{msg.senderIdentifier}</strong>:<br />
                  <img src={msg.content} width={200} alt="image" />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={style.chatbox}>
        <input type="text" placeholder="찾으시는 정보를 입력해주세요..." />
      </div>
    </div>
  );
}
