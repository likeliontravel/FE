"use client";

import { useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function WebSocketChatClient() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const stompClientRef = useRef<any>(null);

  const connectAndSubscribe = () => {
    const queryString = `?accessToken=${encodeURIComponent(
      accessToken
    )}&refreshToken=${encodeURIComponent(
      refreshToken
    )}&groupName=${encodeURIComponent(groupName)}`;

    const socket = new SockJS("https://localhost:8080/ws" + queryString);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      (frame: any) => {
        console.log("Connected:", frame);
        stompClient.subscribe(`/sub/chat/${groupName}`, (message: any) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      (error: any) => {
        alert("WebSocket 연결 실패: " + error);
        console.error(error);
      }
    );

    stompClientRef.current = stompClient;
  };

  const sendTextMessage = () => {
    if (!stompClientRef.current) return;
    stompClientRef.current.send(
      `/pub/chat/${groupName}`,
      {},
      JSON.stringify({ content: message, type: "TEXT" })
    );
    setMessage("");
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("이미지를 선택해주세요.");
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
    stompClientRef.current.send(
      `/pub/chat/${groupName}`,
      {},
      JSON.stringify({ content: imageUrl, type: "IMAGE" })
    );
    setImageUrl("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📡 WebSocket 채팅 클라이언트</h2>
      <div>
        <label>Access Token:</label>
        <input
          type="text"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          size={80}
        />
        <br />
        <br />
        <label>Refresh Token:</label>
        <input
          type="text"
          value={refreshToken}
          onChange={(e) => setRefreshToken(e.target.value)}
          size={80}
        />
        <br />
        <br />
        <label>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <br />
        <br />
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
  );
}
