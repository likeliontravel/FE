"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import style from "../../../../../styles/group/chat.module.scss";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { useChat } from "../../../../../hooks/useChat";

const formatDate = (dateString: string) => {
  const days = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const date = new Date(dateString);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dayName = days[date.getDay()];

  return `${y}.${m}.${d} ${dayName}`;
};

export default function WebSocketChatClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const groupName =
    typeof params.groupName === "string" ? params.groupName : "";
  const groupDescription = searchParams.get("groupDescription") ?? "";

  const { messages } = useSelector((state: RootState) => state.chat);
  const { sendMessage } = useChat(groupName);
  const [inputMessage, setInputMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const success = sendMessage(inputMessage, "TEXT");

    if (success) {
      setInputMessage("");
    } else {
      alert("연결 상태를 확인해주세요.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={style.chatbody}>
      <div className={style.chatcontainer}>
        <div className={style.chatheader}>
          <h2>{decodeURIComponent(groupName)}</h2>
          <p>{decodeURIComponent(groupDescription)}</p>
        </div>
        <div className={style.chatmessages}>
          <div className={style.messages_box}>
            {messages.map((msg: any, idx: number) => {
              const currentDate = msg.sendAt?.split(" ")[0];
              const prevDate =
                idx > 0 ? messages[idx - 1].sendAt?.split(" ")[0] : null;
              const showDateLine = currentDate !== prevDate;

              return (
                <div key={msg.id || idx}>
                  {showDateLine && (
                    <div className={style.date}>
                      <p>{formatDate(msg.sendAt)}</p>
                    </div>
                  )}

                  <div className={style.chatmessage}>
                    {msg.isMine ? (
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
                        <div className={style.text_box}>
                          <div className={style.img_box}>
                            <img
                              src={msg.profileImageUrl}
                              alt="프로필 이미지"
                            />
                            <h4>{msg.name}</h4>
                          </div>
                          {msg.type === "TEXT" ? (
                            <p>{msg.content}</p>
                          ) : (
                            <img
                              className={style.img}
                              src={msg.latestMessage}
                              alt="image"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={style.inputContainer}>
            <input
              className={style.inputContent}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요"
              size={60}
            />
            <Image
              src="/imgs/push.png"
              alt="Send"
              width={50}
              height={50}
              onClick={handleSendMessage}
              style={{ cursor: "pointer" }}
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
