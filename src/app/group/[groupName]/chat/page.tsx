"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import style from "../../../../../styles/group/chat.module.scss";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../store/store";
import { useChat } from "../../../../../hooks/useChat";
import {
  fetchChatList,
  searchMessages,
  clearSearch,
  uploadImageMessage,
  jumpToMessage,
} from "../../../../../util/group/chat/chatSlice";

const formatOnlyDate = (dateString: string) => {
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
  return `${y}.${m}.${d} ${days[date.getDay()]}`;
};

const formatOnlyTime = (dateString: string) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${ampm} ${hours}:${minutes}`;
};

const formatListTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return formatOnlyTime(dateString);
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

const getGroupColor = (name: string) => {
  const colors = [
    "#36a5f2",
    "#f43f70",
    "#a9e32b",
    "#fbde37",
    "#9b51e0",
    "#ff7f50",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return colors[hash % colors.length];
};

export default function WebSocketChatClient() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const groupName =
    typeof params.groupName === "string" ? params.groupName : "";
  const groupDescription = searchParams.get("groupDescription") ?? "";

  const { messages, chatList, searchResults, isSearching, isImageUploading } =
    useSelector((state: RootState) => state.chat);
  const { sendMessage, loadMoreMessages } = useChat(groupName);
  const [inputMessage, setInputMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChats = chatList.filter((chat) => chat.sendAt);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const isInitialLoadPhase = useRef(true);
  const searchScrollRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef<number | null>(null);

  useEffect(() => {
    isInitialLoadPhase.current = true;
    const timer = setTimeout(() => {
      isInitialLoadPhase.current = false;
    }, 1000);
    return () => clearTimeout(timer);
  }, [groupName]);

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      prevScrollHeight.current = scrollRef.current.scrollHeight;
      loadMoreMessages();
    }
  };

  useLayoutEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight } = scrollRef.current;

      if (isJumpingRef.current !== null) {
        const targetId = isJumpingRef.current;
        const targetEl = document.getElementById(`msg-${targetId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.style.backgroundColor = "rgba(39, 171, 241, 0.2)";
          targetEl.style.transition = "background-color 0.5s ease";

          setTimeout(() => {
            targetEl.style.backgroundColor = "transparent";
          }, 2000);
        }
        isJumpingRef.current = null;
        return;
      }

      if (prevScrollHeight.current !== null) {
        scrollRef.current.scrollTop = scrollHeight - prevScrollHeight.current;
        prevScrollHeight.current = null;
      } else {
        if (isInitialMount.current && messages.length > 0) {
          scrollRef.current.scrollTo({
            top: scrollHeight,
            behavior: "auto",
          });
          isInitialMount.current = false;
        } else if (!isInitialMount.current) {
          scrollRef.current.scrollTo({
            top: scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }
  }, [messages]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      dispatch(clearSearch());
      return;
    }
    dispatch(searchMessages({ groupName, keyword: searchKeyword }));
  };

  const handleSearchScroll = () => {
    if (searchScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = searchScrollRef.current;

      if (scrollHeight - scrollTop <= clientHeight + 10) {
        if (searchResults.length > 0) {
          const lastMsg = searchResults[searchResults.length - 1];

          dispatch(
            searchMessages({
              groupName,
              keyword: searchKeyword,
              lastMessageId: lastMsg.id,
              direction: "BEFORE",
            }),
          );
        }
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    if (e.target.value === "") {
      dispatch(clearSearch());
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSearch();
    }
  };

  const handleJumpToMessage = async (messageId: number) => {
    try {
      isJumpingRef.current = messageId;

      await dispatch(
        jumpToMessage({ groupName, lastMessageId: messageId }),
      ).unwrap();
    } catch (error) {
      isJumpingRef.current = null;
      alert("해당 메시지로 이동할 수 없습니다.");
    }
  };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("image", selectedImage);

        const imageUrl = await dispatch(uploadImageMessage(formData)).unwrap();

        sendMessage(imageUrl, "IMAGE");

        handleCancelImage();
      } catch (error) {
        console.error("이미지 업로드 에러:", error);
        alert("이미지 전송에 실패했습니다.");
        return;
      }
    }

    if (inputMessage.trim()) {
      const success = sendMessage(inputMessage, "TEXT");
      if (success) {
        setInputMessage("");
      } else {
        alert("연결 상태를 확인해주세요.");
      }
    }

    prevScrollHeight.current = null;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const imgHeight = e.currentTarget.height;

      const isNearBottom =
        scrollHeight - scrollTop - clientHeight <= imgHeight + 150;

      if (isNearBottom || isInitialLoadPhase.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: isInitialLoadPhase.current ? "auto" : "smooth",
        });
      }
    }
  };

  useEffect(() => {
    dispatch(fetchChatList());

    setSearchKeyword("");
    dispatch(clearSearch());

    return () => {
      dispatch(clearSearch());
    };
  }, [dispatch, groupName]);

  const handleRoomClick = (targetGroupName: string) => {
    if (targetGroupName !== groupName) {
      router.push(`/group/${targetGroupName}/chat`);
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
          <div
            className={style.messages_box}
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {messages.map((msg: any, idx: number) => {
              const currentDate =
                msg.sendAt?.split("T")[0] || msg.sendAt?.split(" ")[0];
              const prevDate =
                idx > 0
                  ? messages[idx - 1].sendAt?.split("T")[0] ||
                    messages[idx - 1].sendAt?.split(" ")[0]
                  : null;

              const showDateLine = currentDate !== prevDate;
              const timeString = msg.sendAt ? formatOnlyTime(msg.sendAt) : "";

              return (
                <div key={msg.id || idx} id={`msg-${msg.id}`}>
                  {showDateLine && (
                    <div className={style.date}>
                      <p>{formatOnlyDate(msg.sendAt)}</p>
                    </div>
                  )}
                  <div className={style.chatmessage}>
                    {msg.isMine ? (
                      <div className={style.mymessage}>
                        <div className={style.text_box}>
                          <span className={style.time_text}>{timeString}</span>
                          {msg.type === "TEXT" ? (
                            <p className={style.my_text}>{msg.content}</p>
                          ) : (
                            <img
                              className={style.img}
                              src={msg.content}
                              alt="image"
                              onLoad={handleImageLoad}
                            />
                          )}
                        </div>
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
                              src={msg.content}
                              alt="image"
                              onLoad={handleImageLoad}
                            />
                          )}
                          <span className={style.time_text}>{timeString}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {previewUrl && (
            <div className={style.image_preview_container}>
              <div className={style.preview_box}>
                <img src={previewUrl} alt="미리보기" />
                <button onClick={handleCancelImage}>✕</button>
              </div>
            </div>
          )}

          <div className={style.inputContainer}>
            <div className={style.input_wrapper}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <div
                className={style.clip_box}
                onClick={() => fileInputRef.current?.click()}
              >
                <img src="/imgs/clip.png" alt="첨부" />
              </div>
              <input
                className={style.inputContent}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요"
              />
            </div>

            <Image
              className={style.send_btn}
              src="/imgs/push.png"
              alt="Send"
              width={50}
              height={50}
              onClick={handleSendMessage}
            />
          </div>
        </div>
      </div>

      <div className={style.chatbox}>
        <div className={style.searchbox}>
          <input
            type="text"
            placeholder="찾으시는 정보를 입력해주세요..."
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
          <img src="/imgs/search.png" alt="search" onClick={handleSearch} />
        </div>
        <div className={style.chatlist}>
          {isSearching ? (
            searchResults.length > 0 ? (
              <div className={style.search_result_container}>
                <div className={style.search_header}>
                  <span>검색 결과 {searchResults.length}건</span>
                </div>
                {searchResults.map((msg) => (
                  <div
                    key={msg.id}
                    className={style.search_item}
                    onClick={() => handleJumpToMessage(msg.id)}
                  >
                    <img
                      className={style.search_profile}
                      src={msg.profileImageUrl || "/imgs/default_profile.png"}
                      alt="profile"
                    />
                    <div className={style.search_info}>
                      <div className={style.search_info_header}>
                        <span className={style.search_name}>{msg.name}</span>
                        <span className={style.search_time}>
                          {formatListTime(msg.sendAt)}
                        </span>
                      </div>
                      <p className={style.search_content}>{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={style.empty_chat}>
                <img src="/imgs/empty_chat_icon.png" alt="결과 없음" />
                <p>일치하는 검색 결과가 없어요</p>
              </div>
            )
          ) : activeChats.length > 0 ? (
            activeChats.map((chat) => (
              <div
                key={chat.groupName}
                className={style.chat_item}
                onClick={() => handleRoomClick(chat.groupName)}
              >
                <div
                  className={style.chat_thumbnail}
                  style={{ backgroundColor: getGroupColor(chat.groupName) }}
                >
                  {chat.groupName.substring(0, 2)}
                </div>

                <div className={style.chat_info}>
                  <div className={style.chat_info_header}>
                    <span className={style.chat_title}>{chat.groupName}</span>
                    <span className={style.chat_time}>
                      {formatListTime(chat.sendAt)}
                    </span>
                  </div>
                  <p className={style.chat_last_msg}>
                    {chat.type === "IMAGE" ? "(사진)" : chat.latestMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className={style.empty_chat}>
              <img
                src="/imgs/empty_chat_icon.png"
                alt="아직 채팅 내역이 없어요"
              />
              <p>앗! 아직 참여 중인 채팅이 없어요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
