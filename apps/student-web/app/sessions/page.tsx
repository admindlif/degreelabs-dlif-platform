"use client";

import * as React from "react";
import { Calendar, ExternalLink, PlayCircle, Video } from "lucide-react";

import { PortalShell } from "@/components/layout/portal-shell";
import { getDiscoverWeeks } from "@/lib/api/discover";
import { DiscoverWeek, SessionSummary } from "@/lib/api/types";

export default function SessionsPage() {
    const [weeks, setWeeks] = React.useState<DiscoverWeek[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        getDiscoverWeeks()
            .then(setWeeks)
            .catch((err) => {
                setError(err?.message || "Unable to load sessions.");
            })
            .finally(() => setLoading(false));
    }, []);

    const sessions: SessionSummary[] = weeks.flatMap(
        (week) => week.sessions
    );

    return (
        <PortalShell
            breadcrumbs={[
                "Cohort 2026-A",
                "DISCOVER (THINK)",
                "My Sessions",
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold">
                        My Sessions
                    </h1>

                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Access upcoming sessions, meeting links and recordings.
                    </p>
                </div>

                {loading && (
                    <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
                        Loading sessions...
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && sessions.length === 0 && (
                    <div className="p-8 rounded-2xl border border-[var(--color-border-default)] text-center">
                        No sessions have been scheduled yet.
                    </div>
                )}

                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="p-5 rounded-2xl bg-white border border-[var(--color-border-default)]"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-orange)]">
                                        Session {session.session_number}
                                    </div>

                                    <h2 className="text-lg font-bold mt-1">
                                        {session.title}
                                    </h2>

                                    {session.description && (
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                            {session.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-muted)]">
                                        <Calendar className="w-4 h-4" />

                                        {session.start_at
                                            ? new Date(session.start_at).toLocaleString()
                                            : "Schedule to be announced"}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {session.meeting_url && (
                                        <a
                                            href={session.meeting_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-orange)] text-white text-xs font-bold"
                                        >
                                            <Video className="w-4 h-4" />
                                            Join Session
                                        </a>
                                    )}

                                    {session.recording_url && (
                                        <a
                                            href={session.recording_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border-default)] text-xs font-bold"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            Recording
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PortalShell>
    );
}