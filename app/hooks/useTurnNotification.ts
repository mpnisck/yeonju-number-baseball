"use client";

import { useCallback, useEffect, useRef } from "react";
import { playTurnSound } from "@/app/lib/sound";

interface UseTurnNotificationOptions {
  /** 현재 내 차례인지 여부 */
  isMyTurn: boolean;
  /** 게임이 진행 중인지 (playing 상태) */
  isPlaying: boolean;
  /** 알림 활성화 여부 (기본: true) */
  enabled?: boolean;
}

/**
 * 멀티플레이어 게임에서 내 차례가 되었을 때 알림을 보내는 훅.
 *
 * - 사운드 재생 (sound.ts의 playTurnSound 활용)
 * - 브라우저 Notification (탭 비활성 시, 권한이 허용된 경우)
 * - 탭 타이틀 변경 (탭 비활성 시 깜빡임)
 *
 * @returns requestNotificationPermission — 사용자 제스처(클릭) 핸들러 내에서 호출
 */
export function useTurnNotification({
  isMyTurn,
  isPlaying,
  enabled = true,
}: UseTurnNotificationOptions) {
  const prevIsMyTurn = useRef<boolean | null>(null);
  const titleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitleRef = useRef<string>("");

  const requestNotificationPermission = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendBrowserNotification = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification("숫자 야구", {
      body: "내 차례입니다! 숫자를 추측하세요.",
      icon: "/favicon.ico",
      tag: "turn-notification",
    });
  }, []);

  const startTitleFlash = useCallback(() => {
    if (typeof document === "undefined") return;

    originalTitleRef.current = document.title;
    let isOriginal = true;

    titleIntervalRef.current = setInterval(() => {
      document.title = isOriginal
        ? "내 차례 — 숫자 야구"
        : originalTitleRef.current;
      isOriginal = !isOriginal;
    }, 1000);
  }, []);

  const stopTitleFlash = useCallback(() => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
    }
    if (typeof document !== "undefined" && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        stopTitleFlash();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopTitleFlash();
    };
  }, [stopTitleFlash]);

  useEffect(() => {
    if (!enabled || !isPlaying) {
      prevIsMyTurn.current = isMyTurn;
      return;
    }

    const wasMyTurn = prevIsMyTurn.current;
    prevIsMyTurn.current = isMyTurn;

    if (isMyTurn && wasMyTurn === false) {
      playTurnSound();

      if (document.hidden) {
        sendBrowserNotification();
        startTitleFlash();
      }
    }
  }, [isMyTurn, isPlaying, enabled, sendBrowserNotification, startTitleFlash]);

  return { requestNotificationPermission };
}
