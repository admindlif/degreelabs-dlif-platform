import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { SerifHighlight } from "@/components/ui/serif-highlight";
import { Badge } from "@/components/ui/badge";
import { CohortSummary, DiscoverProgress, PhaseSummary, SessionSummary } from "@/lib/api/types";

interface DiscoverHeroProps {
  cohort?: CohortSummary | null;
  phase?: PhaseSummary | null;
  progress?: DiscoverProgress | null;
  nextSession?: SessionSummary | null;
}

export function DiscoverHero({
  cohort,
  phase,
  progress,
  nextSession,
}: DiscoverHeroProps) {
  const cohortLabel = cohort?.code ? `DLIF Fellow ${cohort.code}` : "DLIF Fellow";
  const currentWeek = progress?.current_week ?? 1;
  const totalWeeks = progress?.total_weeks ?? 4;
  const percentage = progress?.percentage ?? 25;
  const completedSessions = progress?.completed_sessions ?? 2;
  const nextSessionNum = nextSession
    ? String(nextSession.session_number).padStart(2, "0")
    : "--";

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-8 md:p-10 mb-8">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--color-brand-orange-subtle)] rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--color-brand-blue-subtle)] rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              {cohortLabel}
            </Badge>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              DISCOVER (THINK) → VALIDATE (PROVE) → GROW (DELIVER)
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {phase?.name || "DISCOVER"}
          </h1>

          {/* Signature Brand Voice with Italic Serif Accent */}
          <p className="text-lg md:text-xl text-[var(--color-text-body)] font-medium leading-relaxed">
            The classroom gives knowledge.{" "}
            <SerifHighlight>Discover builds capability.</SerifHighlight>
          </p>
        </div>

        {/* 4-Week Journey Progress Widget */}
        <div className="bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] rounded-2xl p-5 min-w-[280px] shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[var(--color-text-secondary)]">DISCOVER Progress</span>
            <span className="text-[var(--color-brand-orange)] font-bold">
              Week {currentWeek} of {totalWeeks} • {percentage}%
            </span>
          </div>

          {/* Dynamic 4-Segment Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {Array.from({ length: totalWeeks }).map((_, idx) => {
              const weekNum = idx + 1;
              const isPast = weekNum < currentWeek;
              const isCurrent = weekNum === currentWeek;
              return (
                <div
                  key={weekNum}
                  className={`h-2 rounded-full transition-colors ${
                    isPast || isCurrent
                      ? "bg-[var(--color-brand-orange)]"
                      : "bg-[var(--color-border-default)]"
                  }`}
                  title={`W${weekNum}: ${isPast ? "Done" : isCurrent ? "Active" : "Upcoming"}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" /> {completedSessions} Sessions done
            </span>
            <span>Next: Session {nextSessionNum}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
