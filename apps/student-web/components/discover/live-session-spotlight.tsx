import * as React from "react";
import { Video, CalendarPlus, Clock, User, FileText, ExternalLink } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionSummary } from "@/lib/api/types";

interface LiveSessionSpotlightProps {
  session?: SessionSummary | null;
}

export function LiveSessionSpotlight({ session }: LiveSessionSpotlightProps) {
  // Format Date and Time
  const formatSessionTime = (startStr?: string, endStr?: string) => {
    if (!startStr) return "Schedule to be announced";
    try {
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : null;

      const datePart = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const startTimePart = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const endTimePart = end
        ? end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        : "";

      return `${datePart}, ${startTimePart}${endTimePart ? ` – ${endTimePart}` : ""} IST`;
    } catch {
      return "Scheduled • Check Calendar";
    }
  };

  const sessionBadgeLabel = session
    ? session.session_type === "induction"
      ? "Session 0: Induction"
      : session.session_type === "output_review"
        ? `Session ${session.session_number}: Output + Review (Gate)`
        : `Session ${session.session_number}: Learn + Work`
    : "Session 2: Learn + Work";

  const isLive = session?.status === "live";

  return (
    <Card variant="elevated" className="h-full flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--color-brand-orange)] uppercase tracking-wider">
              {isLive ? "Live Now" : "Next Live Session"}
            </span>
          </div>
          <Badge variant="blue" size="sm">
            {sessionBadgeLabel}
          </Badge>
        </div>

        {/* Title */}
        <CardTitle className="text-2xl md:text-3xl font-extrabold mb-2">
          {session?.title || "Problem Framing & Diagnosis"}
        </CardTitle>

        <CardDescription className="text-base text-[var(--color-text-body)] mb-6">
          {session?.description ||
            "Deconstruct the company challenge problem statement with our industry partner, identify core constraints, and map stakeholder requirements."}
        </CardDescription>

        {/* Schedule & Mentor Information Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-brand-orange)] shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Time & Date</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {formatSessionTime(session?.start_at, session?.end_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-brand-blue)] shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Company Challenge Owner</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                Dr. Marcus Vance (SK Innovation)
              </p>
            </div>
          </div>
        </div>

        {/* Session Pre-reads / Materials */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Required Working Evidence
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-secondary)] font-medium hover:border-[var(--color-border-strong)] cursor-pointer transition-colors">
              <FileText className="w-3.5 h-3.5 text-[var(--color-brand-orange)]" />
              <span>SK Innovation Company Challenge Brief</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-secondary)] font-medium hover:border-[var(--color-border-strong)] cursor-pointer transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brand-blue)]" />
              <span>Miro Working Board Template</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-8 border-t border-[var(--color-border-default)] flex flex-wrap items-center gap-3">
        {session?.meeting_url ? (
          <a
            href={session.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              size="lg"
              disabled
              className="w-full sm:w-auto"
            >
              <Video className="w-4 h-4" />
              <span>Meeting Link Coming Soon</span>
            </Button>
          </a>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled
            className="w-full sm:w-auto"
          >
            <Video className="w-4 h-4" />
            <span>Meeting Link Coming Soon</span>
          </Button>
        )}
        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
          <CalendarPlus className="w-4 h-4" />
          <span>Add to Google Calendar</span>
        </Button>
      </div>
    </Card>
  );
}
