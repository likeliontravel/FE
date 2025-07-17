'use client';

import { useEffect, RefObject } from 'react';

const useBetweenScroll = (
  scrollContainerRef: RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetScrollLeft = container.scrollLeft;
    let isAnimating = false;

    const animateScroll = () => {
      isAnimating = true;
      const currentScrollLeft = container.scrollLeft;
      const delta = targetScrollLeft - currentScrollLeft;

      if (Math.abs(delta) < 0.5) {
        container.scrollLeft = targetScrollLeft;
        isAnimating = false;
        return;
      }

      container.scrollLeft = currentScrollLeft + delta * 0.1;
      requestAnimationFrame(animateScroll);
    };

    const onWheel = (e: WheelEvent) => {
      // 컨테이너의 위치 정보 가져오기
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // 마우스가 컨테이너 영역 밖이라면 아무 동작도 하지 않음
      if (
        mouseX < rect.left ||
        mouseX > rect.right ||
        mouseY < rect.top ||
        mouseY > rect.bottom
      ) {
        return;
      }

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const isAtLeftEdge = targetScrollLeft <= 0 && e.deltaY < 0;
      const isAtRightEdge = targetScrollLeft >= maxScrollLeft && e.deltaY > 0;

      if (!isAtLeftEdge && !isAtRightEdge) {
        e.preventDefault();

        // 수평 스크롤 업데이트
        targetScrollLeft += e.deltaY;
        targetScrollLeft = Math.max(
          0,
          Math.min(targetScrollLeft, maxScrollLeft)
        );

        if (!isAnimating) {
          requestAnimationFrame(animateScroll);
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [scrollContainerRef]);

  return scrollContainerRef;
};

export default useBetweenScroll;
