import Link from "next/link";
import {
  IconBaseball,
  IconHash,
  IconTarget,
  IconTrophy,
  IconCpu,
  IconUsers,
  IconChevronRight,
} from "@/app/components/Icons";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 sm:py-16 bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-12 sm:gap-14 w-full max-w-md p-2">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          {/* Icon row */}
          <div className="flex items-center gap-2.5">
            {[
              { Icon: IconBaseball, color: "text-[var(--strike)]" },
              { Icon: IconHash, color: "text-[var(--text-primary)]" },
              { Icon: IconTarget, color: "text-[var(--accent-secondary)]" },
              { Icon: IconTrophy, color: "text-[var(--strike)]" },
            ].map(({ Icon, color }, i) => (
              <div
                key={i}
                className={`w-11 h-11 rounded-xl bg-[var(--bg-input)] flex items-center justify-center ${color} animate-pop-in opacity-0`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <Icon size={18} />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-[var(--text-primary)] leading-tight tracking-tight">
              숫자야구
            </h1>
            <p className="text-[var(--text-secondary)] text-center text-sm sm:text-[15px] leading-relaxed">
              0~9 숫자 중 4개를 골라
              <br />
              스트라이크와 볼로 상대 숫자를 맞춰보세요
            </p>
          </div>
        </div>

        {/* Game Rules */}
        <div className="w-full rounded-2xl border border-[var(--border)] p-6 animate-slide-up opacity-0 delay-3">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] tracking-wider mb-5">
            게임 규칙
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                badge: "S",
                badgeBg: "bg-[var(--strike)]/15",
                badgeText: "text-[var(--strike)]",
                title: "스트라이크",
                desc: "숫자와 위치 모두 정확",
              },
              {
                badge: "B",
                badgeBg: "bg-[var(--accent-secondary)]/10",
                badgeText: "text-[var(--accent-secondary)]",
                title: "볼",
                desc: "숫자는 맞지만 위치가 다름",
              },
              {
                badge: "OUT",
                badgeBg: "bg-[var(--bg-input)]",
                badgeText: "text-[var(--text-muted)]",
                title: "아웃",
                desc: "숫자와 위치 모두 틀림",
              },
            ].map((rule, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-[var(--border)] mb-4" />}
                <div className="flex items-center gap-4">
                  <span
                    className={`shrink-0 w-10 h-8 rounded-lg ${rule.badgeBg} ${rule.badgeText} text-xs font-extrabold flex items-center justify-center`}
                  >
                    {rule.badge}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                      {rule.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex flex-col gap-4 w-full animate-slide-up opacity-0 delay-5">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] tracking-wider px-0.5">
            모드 선택
          </h2>

          <Link
            href="/single"
            className="group w-full flex items-center gap-5 p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--text-primary)]/20 hover:shadow-sm transition-all duration-200"
          >
            <div className="shrink-0 w-14 h-14 rounded-xl bg-[var(--text-primary)] flex items-center justify-center text-white">
              <IconCpu size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
                1인용
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                컴퓨터가 고른 숫자를 맞춰보세요
              </p>
            </div>
            <IconChevronRight
              size={16}
              className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all"
            />
          </Link>

          <Link
            href="/multi"
            className="group w-full flex items-center gap-5 p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--strike)]/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="shrink-0 w-14 h-14 rounded-xl bg-[var(--strike)] flex items-center justify-center text-white">
              <IconUsers size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
                2인용
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                친구와 온라인으로 대결하세요
              </p>
            </div>
            <IconChevronRight
              size={16}
              className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--strike)] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
