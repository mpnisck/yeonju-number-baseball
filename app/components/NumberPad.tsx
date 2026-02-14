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
    <div className="flex flex-col gap-5 w-full p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Selected digits display */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: maxDigits }).map((_, i) => {
          const hasValue = selected[i] !== undefined;
          return (
            <div
              key={i}
              className={`
                w-14 h-16 sm:w-16 sm:h-[72px] rounded-xl flex items-center justify-center
                text-2xl sm:text-[26px] font-bold transition-all duration-200
                ${
                  hasValue
                    ? "bg-[var(--strike)]/10 border-2 border-[var(--strike)]/30 text-[var(--strike)] animate-pop-in shadow-sm"
                    : "bg-[var(--bg-input)] text-[var(--text-muted)]/40 border-2 border-dashed border-[var(--border)]"
                }
              `}
            >
              {hasValue ? selected[i] : <span className="text-sm">_</span>}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border)]" />

      {/* Number grid */}
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }).map((_, digit) => {
          const isSelected = selected.includes(digit);
          return (
            <button
              key={digit}
              onClick={() => onSelect(digit)}
              disabled={disabled || isSelected || isFull}
              className={`
                h-12 sm:h-13 rounded-xl text-base sm:text-lg font-semibold
                transition-all duration-150 active:scale-90
                ${
                  isSelected
                    ? "bg-[var(--strike)]/8 text-[var(--strike)]/40 border border-[var(--strike)]/10"
                    : disabled || isFull
                      ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                      : "bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer hover:shadow-sm"
                }
              `}
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={onDelete}
          disabled={disabled || selected.length === 0}
          className={`
            flex-1 h-12 sm:h-13 rounded-xl text-sm font-semibold
            transition-all duration-150 active:scale-95
            flex items-center justify-center gap-2
            ${
              disabled || selected.length === 0
                ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--danger)]/5 text-[var(--danger)] hover:bg-[var(--danger)]/10 border border-[var(--danger)]/15 cursor-pointer"
            }
          `}
        >
          <IconDelete size={15} />
          <span>지우기</span>
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || !isFull}
          className={`
            flex-[2] h-12 sm:h-13 rounded-xl text-sm font-bold
            transition-all duration-150 active:scale-95
            flex items-center justify-center gap-2
            ${
              disabled || !isFull
                ? "bg-[var(--bg-input)]/60 text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--text-primary)] text-white hover:opacity-90 cursor-pointer shadow-sm"
            }
          `}
        >
          <IconSend size={15} />
          <span>확인</span>
        </button>
      </div>
    </div>
  );
}
