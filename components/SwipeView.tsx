"use client";

import { useState, useRef, useCallback, ReactNode } from "react";

interface SwipeViewProps {
  panes: ReactNode[];
  labels: string[];
}

export default function SwipeView({ panes, labels }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const direction = useRef<"horizontal" | "vertical" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, panes.length - 1));
      setCurrentIndex(clamped);
      setTranslateX(0);
    },
    [panes.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    direction.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (direction.current === null) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < 5 && absDy < 5) return;
      direction.current = absDx > absDy ? "horizontal" : "vertical";
    }

    if (direction.current === "vertical") return;
    setTranslateX(dx);
  };

  const handleTouchEnd = () => {
    const wasHorizontal = direction.current === "horizontal";
    setIsDragging(false);
    direction.current = null;
    if (!wasHorizontal) {
      setTranslateX(0);
      return;
    }
    const threshold = 60;
    if (translateX < -threshold) {
      goTo(currentIndex + 1);
    } else if (translateX > threshold) {
      goTo(currentIndex - 1);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Card area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {panes.map((pane, i) => (
            <div
              key={i}
              className="w-full shrink-0 h-full overflow-y-auto px-4 py-4"
            >
              {pane}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 border-t border-border-subtle bg-bg/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 3l-6 6 6 6" />
            </svg>
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-text-secondary font-medium">
              {labels[currentIndex] || ""}
            </span>
            <div className="flex gap-1.5">
              {panes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentIndex ? "bg-accent" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-text-tertiary font-mono">
              {currentIndex + 1}/{panes.length}
            </span>
          </div>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === panes.length - 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 3l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
