'use client';

import { useState } from 'react';
import style from '../../../../styles/mypage/modify.module.scss';

export default function Subscription_modal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <div className={style.modal_container}>
      {!showPolicy ? (
        <>
          <h3>구독플랜이 해지되었어요</h3>
          <p>언제든 필요하면 다시 구독할 수 있어요!</p>
          <div className={style.showimg}>
            <ul>
              <li className={style.deadline}>
                현재 구독 기간이 종료될 때까지 구독 서비스 이용이 가능해요
              </li>
              <li className={style.stop}>
                구독 해지 후에는 자동 갱신이 중단돼요
              </li>
              <li className={style.show}>
                구독 서비스 잔여 기간에 따라 일부 환불을 제공해요 <br />
                <i onClick={() => setShowPolicy(true)}>[환불정책보기]</i>
              </li>
            </ul>
          </div>
          <button onClick={onClose}>확인</button>
        </>
      ) : (
        <>
          <h3>환불 정책</h3>
          <div className={style.policy}>
            <ol>
              <li>
                <strong>환불안내</strong>
                <ul>
                  <li>
                    구독이 해지되면 현재 결제된 구독 기간이 종료될 때까지
                    서비스를 계속 이용할 수 있습니다.
                  </li>
                  <li>
                    환불 가능 여부는 구독 유형과 결제 방식에 따라 다를 수
                    있으며, 일부 경우는 잔여 기간에 대한 부분 환불이 제공될 수
                    있습니다.
                  </li>
                </ul>
              </li>
              <li>
                <strong>환불 가능 기준</strong>
                <ul>
                  <li>
                    결제일로부터 7일 이내 환불을 요청하신 경우, 전액 환불이
                    가능합니다.
                  </li>
                  <li>
                    시스템 오류 또는 중복 결제의 경우 전액 환불을 도와드립니다.
                  </li>
                </ul>
              </li>
              <li>
                <strong>환불 처리</strong>
                <ul>
                  <li>요청이 접수되면 최대 3일 이내 검토 후 처리됩니다.</li>
                  <li>
                    일부 결제 수단(기프트 카드, 포인트 결제 등)은 환불이 제한될
                    수 있습니다.
                  </li>
                </ul>
              </li>
            </ol>
          </div>
          <button onClick={() => setShowPolicy(false)}>확인</button>
        </>
      )}
    </div>
  );
}
