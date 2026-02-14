"use client";

import { IconDelete, IconSend } from "@/app/components/Icons";

interface NumberPadProps {
  selected: number[];
  onSelect: (digit: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxDigits?: number;
}

export default function NumberPad({
  selected,
  onSelect,
  onDelete,
  onSubmit,
  disabled = false,
  maxDigits = 4,
}: NumberPadProps) {
  const isFull = selected.length >= maxDigits;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Selected digits display */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: maxDigits }).map((_, i) => {
          const hasValue = selected[i] !== undefined;
          return (
            <div
              key={i}
              className={`
                w-16 h-[72px] sm:w-[72px] sm:h-20 rounded-2xl flex items-center justify-center
                text-[26px] sm:text-3xl font-bold transition-all duration-200
                ${
                  hasValue
                    ? "bg-[var(--strike)]/10 border-2 border-[var(--strike)]/40 text-[var(--strike)] animate-pop-in"
                    : "bg-[var(--bg-input)] text-[var(--text-muted)] border-2 border-dashed border-[var(--border)]"
                }
              `}
            >
              {hasValue ? selected[i] : <span className="text-base">_</span>}
            </div>
          );
        })}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, digit) => {
          const isSelected = selected.includes(digit);
          return (
            <button
              key={digit}
              onClick={() => onSelect(digit)}
              disabled={disabled || isSelected || isFull}
              className={`
                h-14 sm:h-[60px] rounded-2xl text-lg sm:text-xl font-semibold
                transition-all duration-150 active:scale-90
                ${
                  isSelected
                    ? "bg-[var(--strike)]/8 text-[var(--strike)]/50 border border-[var(--strike)]/15"
                    : disabled || isFull
                      ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                      : "bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer"
                }
              `}
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onDelete}
          disabled={disabled || selected.length === 0}
          className={`
            flex-1 h-14 sm:h-[60px] rounded-2xl text-sm font-semibold
            transition-all duration-150 active:scale-95
            flex items-center justify-center gap-2
            ${
              disabled || selected.length === 0
                ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--danger)]/5 text-[var(--danger)] hover:bg-[var(--danger)]/10 border border-[var(--danger)]/15 cursor-pointer"
            }
          `}
        >
          <IconDelete size={16} />
          <span>지우기</span>
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || !isFull}
          className={`
            flex-[2] h-14 sm:h-[60px] rounded-2xl text-sm font-bold
            transition-all duration-150 active:scale-95
            flex items-center justify-center gap-2
            ${
              disabled || !isFull
                ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--text-primary)] text-white hover:opacity-90 cursor-pointer"
            }
          `}
        >
          <IconSend size={16} />
          <span>확인</span>
        </button>
      </div>
    </div>
  );
}
