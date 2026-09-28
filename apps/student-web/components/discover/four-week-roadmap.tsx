import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiscoverWeek, SessionSummary } from "@/lib/api/types";

interface FourWeekRoadmapProps {
  weeks?: DiscoverWeek[] | null;
}

interface DisplaySession {
  id: string;
  number: string;
  title: string;
  status: "completed" | "live_soon" | "upcoming" | "locked";
  date: string;
  duration: string;
  hasRecording?: boolean;
  meetingUrl?: string | null;
  recordingUrl?: string | null;
}

interface DisplayWeek {
  weekNumber: string;
  title: string;
  status: "active" | "upcoming" | "locked" | "completed";
  statusBadge: string;
  statusBadgeVariant: "brand" | "blue" | "muted";
  description: string;
  sessions: DisplaySession[];
  weeklyOutput?: {
    title: string;
    status: "submitted" | "pending" | "locked";
  };
}

export function FourWeekRoadmap({ weeks }: FourWeekRoadmapProps) {
  // Format Date and Duration from SessionSummary
  const formatSessionTime = (s: SessionSummary) => {
    if (!s.is_unlocked) {
      return {
        dateStr: "Locked",
        durationStr: "--",
      };
    }

    if (!s.start_at || !s.end_at) {
      return {
        dateStr: "Schedule to be announced",
        durationStr: "--",
      };
    }

    try {
      const start = new Date(s.start_at);
      const end = new Date(s.end_at);

      const dateStr = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      const durationStr =
        `${hours}h ${mins > 0 ? `${mins}m` : "00m"}`;

      return {
        dateStr,
        durationStr,
      };
    } catch {
      return {
        dateStr: "Schedule to be announced",
        durationStr: "--",
      };
    }
  };

  const getWeekOutputInfo = (weekNum: number) => {
    switch (weekNum) {
      case 1:
        return {
          title: "Business Diagnosis & Problem Framing Pack",
          status: "pending" as const,
        };
      case 2:
        return {
          title: "Strategic Possibility & Choice Pack",
          status: "locked" as const,
        };
      case 3:
        return {
          title: "Strategy & Execution Blueprint",
          status: "locked" as const,
        };
      case 4:
        return {
          title: "Executive Proposal · Company Presentation · Strategic Design Portfolio",
          status: "locked" as const,
        };
      default:
        return undefined;
    }
  };

  // Build display weeks from API data if available
  const displayWeeks: DisplayWeek[] = React.useMemo(() => {
    if (weeks && weeks.length > 0) {
      return weeks.map((w) => {
        const badgeVariant: "brand" | "blue" | "muted" =
          w.status === "active"
            ? "brand"
            : w.status === "upcoming"
              ? "blue"
              : "muted";

        const mappedSessions: DisplaySession[] = w.sessions.map((s) => {
          const { dateStr, durationStr } = formatSessionTime(s);
          let sessionStatus: DisplaySession["status"] = "upcoming";

          if (!s.is_unlocked || s.status === "locked") {
            sessionStatus = "locked";
          } else if (s.status === "completed") {
            sessionStatus = "completed";
          } else if (s.status === "live") {
            sessionStatus = "live_soon";
          } else if (w.status === "locked") {
            sessionStatus = "locked";
          }
          const numberLabel =
            s.session_number === 0
              ? "Session 0"
              : s.session_type === "output_review"
                ? `Session ${s.session_number}: Output + Review (Gate)`
                : `Session ${s.session_number}: Learn + Work`;

          return {
            id: s.id,
            number: numberLabel,
            title: s.title,
            status: sessionStatus,
            date: dateStr,
            duration: durationStr,
            hasRecording: s.has_recording,
            meetingUrl: s.meeting_url,
            recordingUrl: s.recording_url,
          };
        });

        return {
          weekNumber: `WEEK ${String(w.week_number).padStart(2, "0")}`,
          title: w.title,
          status: (w.status as DisplayWeek["status"]) || "locked",
          statusBadge: w.status_badge,
          statusBadgeVariant: badgeVariant,
          description: w.description || "",
          sessions: mappedSessions,
          weeklyOutput: getWeekOutputInfo(w.week_number),
        };
      });
    }

    return [];
  }, [weeks]);

  return (
    <div className="mt-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            DISCOVER Roadmap
          </h2>
          <p className="text-sm md:text-base text-[var(--color-text-body)] mt-1">
            Understand before solving. Evidence before confidence. Choices before execution.
          </p>
        </div>
        <Badge variant="brand" size="md">
          DISCOVER Roadmap
        </Badge>
      </div>

      {/* Week Timeline Cards */}
      <div className="space-y-6">
        {displayWeeks.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Roadmap data is unavailable.
          </div>
        ) : displayWeeks.map((week) => {
          const isActive = week.status === "active";
          const isLocked = week.status === "locked";

          return (
            <div
              key={week.weekNumber}
              className={`rounded-[24px] border transition-all duration-200 overflow-hidden ${isActive
                  ? "bg-[var(--color-bg-canvas)] border-[var(--color-brand-blue)] shadow-[0_4px_30px_rgba(56,119,249,0.08)]"
                  : isLocked
                    ? "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] opacity-75"
                    : "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]"
                }`}
            >
              {/* Week Title Bar */}
              <div className="p-6 md:p-8 border-b border-[var(--color-border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-text-muted)]">
                      {week.weekNumber}
                    </span>
                    <Badge variant={week.statusBadgeVariant} size="sm">
                      {week.statusBadge}
                    </Badge>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    {week.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-body)] max-w-3xl">
                    {week.description}
                  </p>
                </div>

                {isLocked ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                    <Lock className="w-4 h-4" />
                    <span>Locked</span>
                  </div>
                ) : (
                  <Badge variant={isActive ? "brand" : "blue"} size="md">
                    {week.sessions.length} Sessions
                  </Badge>
                )}
              </div>

              {/* Sessions List */}
              <div className="divide-y divide-[var(--color-border-default)] bg-[var(--color-bg-canvas)]">
                {week.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 md:px-8 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {session.status === "locked" ? (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : session.status === "completed" ? (
                        <div className="w-8 h-8 rounded-full bg-[#E8FAF0] text-[#128C48] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : session.status === "live_soon" ? (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-brand-orange-subtle)] text-[var(--color-brand-orange)] flex items-center justify-center shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-orange)] animate-ping" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                            {session.number}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)]">• {session.date}</span>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-[var(--color-text-primary)]">
                          {session.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">
                        {session.duration}
                      </span>

                      {session.status === "completed" && session.hasRecording && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (session.recordingUrl) window.open(session.recordingUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-[var(--color-brand-blue)]" />
                          <span>Watch Recording</span>
                        </Button>
                      )}

                      {session.status === "live_soon" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (session.meetingUrl) window.open(session.meetingUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span>Join Live</span>
                        </Button>
                      )}

                      {session.status === "upcoming" && (
                        <Button variant="ghost" size="sm">
                          <span>View Details</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Output Strip */}
              {week.weeklyOutput && (
                <div className="p-4 md:px-8 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[var(--color-brand-orange)]" />
                    <div>
                      <span className="font-bold text-[var(--color-text-primary)]">
                        Weekly output:{" "}
                      </span>
                      <span className="text-[var(--color-text-body)]">
                        {week.weeklyOutput.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {week.weeklyOutput.status === "pending" ? (
                      <Button variant="primary" size="sm">
                        Submit Weekly Output
                      </Button>
                    ) : (
                      <Badge variant="muted" size="sm">
                        Not Yet Open
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
