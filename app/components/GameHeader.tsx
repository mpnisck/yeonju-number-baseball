"use client";

import Link from "next/link";
import { IconArrowLeft, IconRefresh } from "@/app/components/Icons";

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  onReset?: () => void;
  children?: React.ReactNode;
}

export default function GameHeader({
  title,
  subtitle,
  onReset,
  children,
}: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between w-full mb-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <IconRefresh size={14} />
            <span>다시하기</span>
          </button>
        )}
      </div>
    </header>
  );
}
