"use client";

import { useCallback, useState } from "react";
import { IconCopy, IconLink } from "@/app/components/Icons";

interface ShareLinkProps {
  roomCode: string;
}

export default function ShareLink({ roomCode }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/multi/${roomCode}`
      : "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <IconLink size={16} />
        <span className="text-xs font-medium">초대 링크</span>
      </div>

      <div className="flex items-center gap-2.5 w-full max-w-sm">
        <div className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-sm text-[var(--text-secondary)] truncate font-mono">
          {shareUrl || `.../${roomCode}`}
        </div>
        <button
          onClick={handleCopy}
          className={`
            px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
            flex items-center gap-2
            ${
              copied
                ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/15"
                : "bg-[var(--text-primary)] text-white hover:opacity-90"
            }
          `}
        >
          <IconCopy size={14} />
          <span>{copied ? "복사됨!" : "복사"}</span>
        </button>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] text-center">
        링크를 상대방에게 공유하세요
      </p>
    </div>
  );
}
