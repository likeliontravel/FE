'use client';

import { useEffect } from 'react';

const useBetweenScroll = (scrollContainerRef: any) => {
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetScrollLeft = container.scrollLeft;
    let isAnimating = false;

    const animateScroll = (): void => {
      isAnimating = true;
      const currentScrollLeft = container.scrollLeft;
      const delta = targetScrollLeft - currentScrollLeft;

      if (Math.abs(delta) < 0.5) {
        // 애니메이션을 끝까지 부드럽게 유지
        container.scrollLeft = targetScrollLeft;
        isAnimating = false;
        return;
      }

      container.scrollLeft = currentScrollLeft + delta * 0.1;
      requestAnimationFrame(animateScroll);
    };

    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      targetScrollLeft += e.deltaY;
      targetScrollLeft = Math.max(
        0,
        Math.min(
          targetScrollLeft,
          container.scrollWidth - container.clientWidth
        )
      );

      if (!isAnimating) {
        requestAnimationFrame(animateScroll);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  return scrollContainerRef;
};

export default useBetweenScroll;
