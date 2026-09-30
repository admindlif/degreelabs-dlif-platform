"use client";

import * as React from "react";
import {
    Building2,
    ExternalLink,
    FileText,
    Target,
} from "lucide-react";

import { PortalShell } from "@/components/layout/portal-shell";
import { getCompanyChallenge } from "@/lib/api/toolkit";
import { CompanyChallenge } from "@/lib/api/types";

export default function CompanyChallengePage() {
    const [challenge, setChallenge] =
        React.useState<CompanyChallenge | null>(null);

    const [loading, setLoading] = React.useState(true);

    const [error, setError] =
        React.useState<string | null>(null);

    React.useEffect(() => {
        getCompanyChallenge()
            .then(setChallenge)
            .catch((err) => {
                setError(
                    err?.message ||
                    "Unable to load Company Challenge."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <PortalShell
            breadcrumbItems={["Company Challenge"]}
        >
            <div className="min-w-0 space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold">
                        Company Challenge
                    </h1>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Explore your Team&apos;s assigned company,
                        challenge, and reference materials.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-[var(--color-border-default)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
                        Loading Company Challenge...
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && challenge && (
                    <>
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Company */}
                            <section className="min-w-0 rounded-2xl border border-[var(--color-border-default)] bg-white p-5 sm:p-6">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-blue-subtle)]">
                                        <Building2 className="h-5 w-5 text-[var(--color-brand-blue)]" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                                            Company
                                        </p>

                                        <h2 className="mt-1 break-words text-xl font-bold">
                                            {challenge.company_name ||
                                                "Company information pending"}
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    {challenge.company_overview ? (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--color-text-body)]">
                                            {challenge.company_overview}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            Company overview has not been added yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Challenge */}
                            <section className="min-w-0 rounded-2xl border border-[var(--color-border-default)] bg-white p-5 sm:p-6">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-blue-subtle)]">
                                        <Target className="h-5 w-5 text-[var(--color-brand-blue)]" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                                            Challenge
                                        </p>

                                        <h2 className="mt-1 break-words text-xl font-bold">
                                            {challenge.company_challenge ||
                                                "Challenge information pending"}
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    {challenge.challenge_description ? (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--color-text-body)]">
                                            {challenge.challenge_description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            Challenge description has not been added yet.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Reference Materials */}
                        <section className="min-w-0 rounded-2xl border border-[var(--color-border-default)] bg-white p-5 sm:p-6">
                            <div>
                                <h2 className="text-lg font-bold">
                                    Reference Materials
                                </h2>

                                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                                    Company briefs, Drive documents, and
                                    supporting material shared by the Admin.
                                </p>
                            </div>

                            {challenge.resources.length === 0 ? (
                                <div className="mt-5 rounded-xl bg-[var(--color-bg-subtle)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                                    No reference materials have been added yet.
                                </div>
                            ) : (
                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {challenge.resources.map(
                                        (resource) => (
                                            <div
                                                key={resource.id}
                                                className="min-w-0 rounded-xl border border-[var(--color-border-default)] p-4"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-subtle)]">
                                                        <FileText className="h-5 w-5 text-[var(--color-brand-blue)]" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="break-words font-bold">
                                                            {resource.title}
                                                        </h3>

                                                        <p className="mt-1 text-xs capitalize text-[var(--color-text-muted)]">
                                                            {resource.resource_type}
                                                        </p>
                                                    </div>
                                                </div>

                                                {resource.url && (
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-brand-blue)] hover:underline"
                                                    >
                                                        {resource.is_downloadable
                                                            ? "Open / Download"
                                                            : "Open Resource"}

                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        <div className="text-xs text-[var(--color-text-muted)]">
                            Assigned to Team {challenge.team_name}
                        </div>
                    </>
                )}
            </div>
        </PortalShell>
    );
}