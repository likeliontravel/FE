'use client';
import { useParams } from 'next/navigation';

export default function groupDetail() {
  const params = useParams();
  const groupId = params.groupId;

  return (
    <div>
      <div>
        <div>
          <h1>{groupId}</h1>
          <p>멋쟁이 사자처럼</p>
        </div>
        <p>린님 외 7명의 멤버가 있어요</p>
      </div>
      <div>
        <div>
          <p>공지</p>
          <div>
            <p>린</p>
            <p>다들 낼 날씨 춥대요 따뜻하게 입고 오시오</p>
          </div>
        </div>
        <div>
          <p>멤버 초대</p>
          <img src="" alt="" />
        </div>
        <div>
          <p>그룹 채팅</p>
          <img src="" alt="" />
        </div>
      </div>
      <h1>
        <i>멋사</i>의 여행 일정
      </h1>
    </div>
  );
}
