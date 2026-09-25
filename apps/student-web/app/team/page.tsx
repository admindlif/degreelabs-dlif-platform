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
            breadcrumbs={[
                "Cohort 2026-A",
                "DISCOVER (THINK)",
                "My Team",
            ]}
        >
            <div className="space-y-6">
                <h1 className="text-2xl font-extrabold">
                    My Team
                </h1>

                {loading ? (
                    <p>Loading team...</p>
                ) : !team ? (
                    <div className="p-8 rounded-2xl border border-[var(--color-border-default)]">
                        Team assignment is pending.
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-white border border-[var(--color-border-default)]">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-[var(--color-brand-blue)]" />

                            <div>
                                <h2 className="text-xl font-bold">
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
                                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-subtle)]"
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