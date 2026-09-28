"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { PortalShell } from "@/components/layout/portal-shell";
import { getFellowTeam } from "@/lib/api/toolkit";
import { FellowTeam } from "@/lib/api/types";

export default function TeamPage() {
    const [team, setTeam] = React.useState<FellowTeam | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getFellowTeam()
            .then(setTeam)
            .catch(() => setTeam(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PortalShell
            breadcrumbItems={["My Team"]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold">My Team</h1>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        View your Team assignment, challenge, and members.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-[var(--color-border-default)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                        Loading Team...
                    </div>
                ) : !team ? (
                    <div className="rounded-2xl border border-[var(--color-border-default)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                        Team assignment is pending.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-white p-5 sm:p-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Users className="h-6 w-6 shrink-0 text-[var(--color-brand-blue)]" />

                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-bold">
                                    Team {team.name}
                                </h2>

                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {team.member_count} Fellows
                                </p>
                            </div>
                        </div>

                        {team.company_name && (
                            <div className="mt-6">
                                <div className="text-xs font-bold uppercase text-[var(--color-text-muted)]">
                                    Company
                                </div>

                                <div className="font-bold mt-1">
                                    {team.company_name}
                                </div>
                            </div>
                        )}

                        {team.company_challenge && (
                            <div className="mt-4">
                                <div className="text-xs font-bold uppercase text-[var(--color-text-muted)]">
                                    Company Challenge
                                </div>

                                <div className="mt-1">
                                    {team.company_challenge}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 space-y-2">
                            <h3 className="font-bold">
                                Team Members
                            </h3>

                            {team.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex flex-col gap-1 rounded-xl bg-[var(--color-bg-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span>
                                        {member.first_name} {member.last_name}
                                    </span>

                                    <span className="text-xs capitalize text-[var(--color-text-muted)]">
                                        {member.team_role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PortalShell>
    );
}
