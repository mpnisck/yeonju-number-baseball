/**
 * Web Audio API를 사용한 알림 사운드 유틸리티
 * 외부 사운드 파일 없이 브라우저에서 직접 효과음을 생성합니다.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    try {
      audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    } catch {
      return null;
    }
  }

  // suspended 상태이면 resume 시도
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

/**
 * 내 차례 알림 사운드 (맑은 2음 차임)
 */
export function playTurnSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 첫 번째 음 (C5 - 523Hz)
  playTone(ctx, 523.25, now, 0.15, 0.3);
  // 두 번째 음 (E5 - 659Hz) — 약간 높은 음으로 상승감
  playTone(ctx, 659.25, now + 0.12, 0.18, 0.35);
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // 부드러운 시작과 끝
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}
