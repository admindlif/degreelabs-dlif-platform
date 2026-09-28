"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    FileCheck,
    FolderOpen,
    MessageSquare,
    PlayCircle,
    RefreshCw,
    Video,
} from "lucide-react";

import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import {
    getSessionDetail,
    getSessionResources,
    getSessionSubmission,
    saveSessionSubmission,
    getSessionFeedback,
} from "@/lib/api/discover";
import {
    PhaseResource,
    SessionDetail,
    SessionSubmissionResponse,
    SubmissionFeedback,
} from "@/lib/api/types";

type Tab =
    | "overview"
    | "resources"
    | "recording"
    | "submission"
    | "feedback";

export default function SessionWorkspacePage() {
    const params = useParams();

    const sessionId = params.sessionId as string;

    const [session, setSession] =
        React.useState<SessionDetail | null>(null);

    const [resources, setResources] =
        React.useState<PhaseResource[]>([]);

    const [resourcesLoading, setResourcesLoading] =
        React.useState(false);

    const [resourcesError, setResourcesError] =
        React.useState<string | null>(null);

    const [resourcesLoaded, setResourcesLoaded] =
        React.useState(false);

    const [submissionData, setSubmissionData] =
        React.useState<SessionSubmissionResponse | null>(null);

    const [submissionUrl, setSubmissionUrl] =
        React.useState("");

    const [submissionLoading, setSubmissionLoading] =
        React.useState(false);

    const [submissionSaving, setSubmissionSaving] =
        React.useState(false);

    const [submissionError, setSubmissionError] =
        React.useState<string | null>(null);

    const [submissionLoaded, setSubmissionLoaded] =
        React.useState(false);

    const [activeTab, setActiveTab] =
        React.useState<Tab>("overview");

    const [loading, setLoading] =
        React.useState(true);

    const [error, setError] =
        React.useState<string | null>(null);

    const [feedback, setFeedback] =
        React.useState<SubmissionFeedback | null>(null);

    const [feedbackLoading, setFeedbackLoading] =
        React.useState(false);

    const [feedbackError, setFeedbackError] =
        React.useState<string | null>(null);

    const [feedbackLoaded, setFeedbackLoaded] =
        React.useState(false);

    const loadSession = React.useCallback(
        async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getSessionDetail(
                    sessionId
                );

                setSession(data);
            } catch (err: any) {
                setError(
                    err?.message ||
                    "Unable to load this Session."
                );
            } finally {
                setLoading(false);
            }
        },
        [sessionId]
    );

    React.useEffect(() => {
        if (sessionId) {
            loadSession();
        }
    }, [sessionId, loadSession]);

    React.useEffect(() => {
        if (
            activeTab !== "resources" ||
            resourcesLoaded ||
            !sessionId
        ) {
            return;
        }

        async function loadResources() {
            setResourcesLoading(true);
            setResourcesError(null);

            try {
                const data = await getSessionResources(
                    sessionId
                );

                setResources(data);
                setResourcesLoaded(true);
            } catch (err: any) {
                setResourcesError(
                    err?.message ||
                    "Unable to load Session resources."
                );
            } finally {
                setResourcesLoading(false);
            }
        }

        loadResources();
    }, [
        activeTab,
        resourcesLoaded,
        sessionId,
    ]);

    React.useEffect(() => {
        if (
            activeTab !== "submission" ||
            submissionLoaded ||
            !sessionId ||
            !session?.submission_enabled
        ) {
            return;
        }

        async function loadSubmission() {
            setSubmissionLoading(true);
            setSubmissionError(null);

            try {
                const data = await getSessionSubmission(
                    sessionId
                );

                setSubmissionData(data);

                if (data.submission?.drive_url) {
                    setSubmissionUrl(
                        data.submission.drive_url
                    );
                }

                setSubmissionLoaded(true);
            } catch (err: any) {
                setSubmissionError(
                    err?.message ||
                    "Unable to load Team submission."
                );
            } finally {
                setSubmissionLoading(false);
            }
        }

        loadSubmission();
    }, [
        activeTab,
        submissionLoaded,
        sessionId,
        session?.submission_enabled,
    ]);

    React.useEffect(() => {
        if (
            activeTab !== "feedback" ||
            feedbackLoaded ||
            !sessionId
        ) {
            return;
        }

        async function loadFeedback() {
            setFeedbackLoading(true);
            setFeedbackError(null);

            try {
                const data =
                    await getSessionFeedback(
                        sessionId
                    );

                setFeedback(data);
                setFeedbackLoaded(true);
            } catch (err: any) {
                setFeedbackError(
                    err?.message ||
                    "Unable to load Team feedback."
                );
            } finally {
                setFeedbackLoading(false);
            }
        }

        loadFeedback();
    }, [
        activeTab,
        feedbackLoaded,
        sessionId,
    ]);

    if (loading) {
        return (
            <PortalShell>
                <div className="py-20 text-center text-sm text-[var(--color-text-muted)]">
                    Loading Session...
                </div>
            </PortalShell>
        );
    }



    if (error || !session) {
        return (
            <PortalShell>
                <div className="max-w-2xl mx-auto py-16">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h1 className="font-bold text-red-800">
                            Unable to open Session
                        </h1>

                        <p className="text-sm text-red-700 mt-2">
                            {error}
                        </p>

                        <div className="flex gap-3 mt-5">
                            <Button
                                variant="secondary"
                                onClick={loadSession}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </Button>

                            <Link href="/sessions">
                                <Button variant="secondary">
                                    Back to Sessions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </PortalShell>
        );
    }

    async function handleSubmissionSave() {
        const url = submissionUrl.trim();

        if (!url) {
            setSubmissionError(
                "Please enter the Google Drive submission link."
            );
            return;
        }

        setSubmissionSaving(true);
        setSubmissionError(null);

        try {
            const data = await saveSessionSubmission(
                sessionId,
                url
            );

            setSubmissionData(data);
            setSubmissionUrl(
                data.submission?.drive_url ?? ""
            );
        } catch (err: any) {
            setSubmissionError(
                err?.message ||
                "Unable to save Team submission."
            );
        } finally {
            setSubmissionSaving(false);
        }
    }

    const tabs: {
        key: Tab;
        label: string;
        icon: React.ElementType;
    }[] = [
            {
                key: "overview",
                label: "Overview & Meeting",
                icon: Video,
            },
            {
                key: "resources",
                label: "Resources",
                icon: FolderOpen,
            },
            {
                key: "recording",
                label: "Recording & Transcript",
                icon: PlayCircle,
            },
            {
                key: "submission",
                label: "Submission",
                icon: FileCheck,
            },
            {
                key: "feedback",
                label: "Feedback",
                icon: MessageSquare,
            },
        ];

    return (
        <PortalShell
            breadcrumbs={[
                "DISCOVER",
                session.week_number
                    ? `Week ${session.week_number}`
                    : "Induction",
                `Session ${session.session_number}`,
            ]}
        >
            <div className="space-y-6">
                <Link
                    href="/sessions"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sessions
                </Link>

                <div className="rounded-3xl border border-[var(--color-border-default)] bg-white overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-[var(--color-border-default)]">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-orange)]">
                            Session {session.session_number}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
                            {session.title}
                        </h1>

                        {session.description && (
                            <p className="text-sm text-[var(--color-text-body)] mt-3 max-w-3xl">
                                {session.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-5 text-sm text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />

                                {session.start_at
                                    ? new Date(
                                        session.start_at
                                    ).toLocaleString()
                                    : "Schedule to be announced"}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-b border-[var(--color-border-default)]">
                        <div className="flex min-w-max px-4">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                const active =
                                    activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() =>
                                            setActiveTab(tab.key)
                                        }
                                        className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 ${active
                                            ? "border-[var(--color-brand-orange)] text-[var(--color-text-primary)]"
                                            : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Session Details
                                    </h2>

                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        Review the Session schedule and
                                        join the live meeting.
                                    </p>
                                </div>

                                {session.meeting_url ? (
                                    <a
                                        href={session.meeting_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-brand-orange)] text-white text-sm font-bold"
                                    >
                                        <Video className="w-4 h-4" />
                                        Join Google Meet
                                    </a>
                                ) : (
                                    <div className="rounded-xl border border-[var(--color-border-default)] p-4 text-sm text-[var(--color-text-muted)]">
                                        Meeting link has not been
                                        published yet.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "resources" && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Session Resources
                                    </h2>

                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        Materials shared by the Admin for this
                                        Session.
                                    </p>
                                </div>

                                {resourcesLoading && (
                                    <div className="rounded-xl border border-[var(--color-border-default)] p-5 text-sm text-[var(--color-text-muted)]">
                                        Loading resources...
                                    </div>
                                )}

                                {resourcesError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        {resourcesError}
                                    </div>
                                )}

                                {!resourcesLoading &&
                                    !resourcesError &&
                                    resources.length === 0 && (
                                        <div className="rounded-xl border border-[var(--color-border-default)] p-5 text-sm text-[var(--color-text-muted)]">
                                            No resources have been added for this
                                            Session yet.
                                        </div>
                                    )}

                                {!resourcesLoading &&
                                    resources.length > 0 && (
                                        <div className="space-y-3">
                                            {resources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--color-border-default)] p-4"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-[var(--color-text-primary)]">
                                                            {resource.title}
                                                        </div>

                                                        {resource.subtitle && (
                                                            <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                                {resource.subtitle}
                                                            </div>
                                                        )}

                                                        <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mt-2">
                                                            {resource.resource_type}
                                                        </div>
                                                    </div>

                                                    {resource.url && (
                                                        <a
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs font-bold hover:border-[var(--color-brand-blue)]"
                                                        >
                                                            {resource.is_downloadable
                                                                ? "Download"
                                                                : "Open Resource"}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}
                        {activeTab === "recording" && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Recording & Transcript
                                    </h2>
                                </div>

                                {session.recording_url ? (
                                    <a
                                        href={session.recording_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 font-semibold text-sm text-[var(--color-brand-blue)]"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                        Watch Recording
                                    </a>
                                ) : (
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        Recording is not available yet.
                                    </p>
                                )}

                                {session.transcript_url ? (
                                    <a
                                        href={session.transcript_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block font-semibold text-sm text-[var(--color-brand-blue)]"
                                    >
                                        Open Transcript
                                    </a>
                                ) : (
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        Transcript is not available yet.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "submission" && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Team Submission
                                    </h2>

                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        Submit your Team&apos;s Google Drive work link for this Session.
                                    </p>
                                </div>

                                {!session.submission_enabled && (
                                    <div className="rounded-xl border border-[var(--color-border-default)] p-5 text-sm text-[var(--color-text-muted)]">
                                        No submission is required for this Session.
                                    </div>
                                )}

                                {session.submission_enabled &&
                                    submissionLoading && (
                                        <div className="rounded-xl border border-[var(--color-border-default)] p-5 text-sm text-[var(--color-text-muted)]">
                                            Loading Team submission...
                                        </div>
                                    )}

                                {session.submission_enabled &&
                                    submissionError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                            {submissionError}
                                        </div>
                                    )}

                                {session.submission_enabled &&
                                    !submissionLoading &&
                                    submissionData && (
                                        <div className="space-y-5">

                                            {submissionData.submission && (
                                                <div className="rounded-xl border border-[var(--color-border-default)] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                                        Current Submission
                                                    </div>

                                                    <a
                                                        href={
                                                            submissionData.submission.drive_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-sm font-bold text-[var(--color-brand-blue)]"
                                                    >
                                                        Open Submitted Drive Link
                                                    </a>

                                                    <div className="text-xs text-[var(--color-text-muted)] mt-2">
                                                        Last submitted{" "}
                                                        {new Date(
                                                            submissionData.submission.submitted_at
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}

                                            {!submissionData.submission &&
                                                !submissionData.can_submit && (
                                                    <div className="rounded-xl border border-[var(--color-border-default)] p-5 text-sm text-[var(--color-text-muted)]">
                                                        Your Team Lead has not submitted work yet.
                                                    </div>
                                                )}

                                            {submissionData.can_submit ? (
                                                <div className="rounded-xl border border-[var(--color-border-default)] p-5 space-y-4">

                                                    <div>
                                                        <label className="block text-sm font-bold mb-2">
                                                            Google Drive Submission Link
                                                        </label>

                                                        <input
                                                            type="url"
                                                            value={submissionUrl}
                                                            onChange={(event) =>
                                                                setSubmissionUrl(
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="https://drive.google.com/..."
                                                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-default)] text-sm"
                                                        />
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        onClick={handleSubmissionSave}
                                                        disabled={
                                                            submissionSaving ||
                                                            !submissionUrl.trim()
                                                        }
                                                    >
                                                        {submissionSaving
                                                            ? "Saving..."
                                                            : submissionData.submission
                                                                ? "Resubmit"
                                                                : "Submit"}
                                                    </Button>

                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        Only the Team Lead can submit or resubmit work.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    Only the Team Lead can submit or resubmit work. Team members can view the submitted link.
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        )}
                        {activeTab === "feedback" && (
                            <div className="space-y-5">

                                <div>
                                    <h2 className="text-lg font-bold">
                                        Feedback
                                    </h2>

                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        Review feedback provided for your Team&apos;s submission.
                                    </p>
                                </div>


                                {feedbackLoading && (
                                    <div className="rounded-2xl border border-[var(--color-border-default)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                                        Loading feedback...
                                    </div>
                                )}


                                {feedbackError && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        {feedbackError}
                                    </div>
                                )}


                                {!feedbackLoading &&
                                    !feedbackError &&
                                    !feedback && (
                                        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] p-6">

                                            <h3 className="text-sm font-bold">
                                                No feedback yet
                                            </h3>

                                            <p className="text-sm text-[var(--color-text-muted)] mt-2">
                                                Your Team&apos;s submission has not been reviewed yet.
                                            </p>

                                        </div>
                                    )}


                                {!feedbackLoading &&
                                    !feedbackError &&
                                    feedback && (
                                        <div className="rounded-2xl border border-[var(--color-border-default)] overflow-hidden">

                                            <div className="flex items-center justify-between gap-4 p-5 border-b border-[var(--color-border-default)]">

                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                                                        Review Status
                                                    </div>

                                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                        Updated{" "}
                                                        {new Date(
                                                            feedback.updated_at
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>


                                                {feedback.status ===
                                                    "accepted" ? (
                                                    <span className="inline-flex px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                                        Accepted
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                                                        Revision Required
                                                    </span>
                                                )}

                                            </div>


                                            <div className="p-5 space-y-5">

                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                                        Admin Feedback
                                                    </div>

                                                    <p className="text-sm text-[var(--color-text-body)] whitespace-pre-wrap leading-6">
                                                        {feedback.feedback_text}
                                                    </p>
                                                </div>


                                                {feedback.feedback_url && (
                                                    <div className="pt-4 border-t border-[var(--color-border-default)]">

                                                        <a
                                                            href={
                                                                feedback.feedback_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-bold"
                                                        >
                                                            Open Feedback / Reference Link
                                                        </a>

                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    )}

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}