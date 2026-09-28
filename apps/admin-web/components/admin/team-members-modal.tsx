"use client";

import * as React from "react";

import {
    AdminCohortFellow,
    AdminTeam,
    TeamDetail,
    addTeamMember,
    assignTeamLead,
    getAdminTeam,
    getCohortFellows,
    removeTeamMember,
} from "@/lib/api/admin";

interface TeamMembersModalProps {
    team: AdminTeam;
    onClose: () => void;
    onChanged: () => Promise<void> | void;
}

export function TeamMembersModal({
    team,
    onClose,
    onChanged,
}: TeamMembersModalProps) {
    const [detail, setDetail] =
        React.useState<TeamDetail | null>(null);

    const [cohortFellows, setCohortFellows] =
        React.useState<AdminCohortFellow[]>([]);

    const [loading, setLoading] =
        React.useState(true);

    const [savingUserId, setSavingUserId] =
        React.useState<string | null>(null);

    const [error, setError] =
        React.useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        setError(null);

        try {
            const [
                teamData,
                cohortFellowsData,
            ] = await Promise.all([
                getAdminTeam(team.id),
                getCohortFellows(team.cohort_id),
            ]);

            setDetail(teamData);

            setCohortFellows(
                cohortFellowsData.filter(
                    (fellow) =>
                        fellow.enrollment_status === "active"
                )
            );
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to load Team information."
            );
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, [team.id, team.cohort_id]);

    // -----------------------------------------------
    // Fellows in Cohort but NOT in this Team
    // -----------------------------------------------
    const availableFellows =
        cohortFellows.filter((fellow) => {
            const alreadyMember =
                detail?.members.some(
                    (member) =>
                        member.user_id === fellow.fellow_id
                );

            return !alreadyMember;
        });

    // -----------------------------------------------
    // Add Fellow to Team
    // -----------------------------------------------
    async function handleAddFellow(
        fellowId: string
    ) {
        setSavingUserId(fellowId);
        setError(null);

        try {
            await addTeamMember(
                team.id,
                {
                    user_id: fellowId,
                    team_role: "member",
                }
            );

            await loadData();
            await onChanged();
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to add Fellow to Team."
            );
        } finally {
            setSavingUserId(null);
        }
    }

    // -----------------------------------------------
    // Assign / change Team Lead
    // -----------------------------------------------
    async function handleMakeLead(
        userId: string
    ) {
        const confirmed =
            window.confirm(
                "Make this Fellow the Team Lead?"
            );

        if (!confirmed) {
            return;
        }

        setSavingUserId(userId);
        setError(null);

        try {
            await assignTeamLead(
                team.id,
                userId
            );

            await loadData();
            await onChanged();
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to assign Team Lead."
            );
        } finally {
            setSavingUserId(null);
        }
    }

    // -----------------------------------------------
    // Remove Fellow from Team
    // -----------------------------------------------
    async function handleRemoveMember(
        userId: string
    ) {
        const confirmed =
            window.confirm(
                "Remove this Fellow from the Team?"
            );

        if (!confirmed) {
            return;
        }

        setSavingUserId(userId);
        setError(null);

        try {
            await removeTeamMember(
                team.id,
                userId
            );

            await loadData();
            await onChanged();
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to remove Fellow from Team."
            );
        } finally {
            setSavingUserId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-extrabold">
                            Manage Team
                        </h3>

                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Team {team.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                        Loading Team...
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* ================================================= */}
                        {/* CURRENT TEAM MEMBERS */}
                        {/* ================================================= */}

                        <div>
                            <div className="mb-3">
                                <h4 className="text-sm font-extrabold">
                                    Team Members
                                </h4>

                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    Fellows currently assigned to Team {team.name}.
                                </p>
                            </div>

                            {!detail ||
                                detail.members.length === 0 ? (
                                <div className="rounded-xl border border-[var(--color-border-default)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                                    No Fellows have been added to this Team yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {detail.members.map(
                                        (member) => {
                                            const isLead =
                                                member.team_role ===
                                                "lead";

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border-default)] p-4"
                                                >

                                                    <div>
                                                        <div className="text-sm font-bold">
                                                            {member.first_name}{" "}
                                                            {member.last_name}
                                                        </div>

                                                        <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                            {member.email}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        {isLead ? (
                                                            <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                                Team Lead
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    savingUserId ===
                                                                    member.user_id
                                                                }
                                                                onClick={() =>
                                                                    handleMakeLead(
                                                                        member.user_id
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 rounded-lg border border-[var(--color-border-default)] text-xs font-bold hover:border-[var(--color-brand-blue)]"
                                                            >
                                                                Make Team Lead
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                savingUserId ===
                                                                member.user_id
                                                            }
                                                            onClick={() =>
                                                                handleRemoveMember(
                                                                    member.user_id
                                                                )
                                                            }
                                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50"
                                                        >
                                                            Remove
                                                        </button>

                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ================================================= */}
                        {/* AVAILABLE FELLOWS FROM THIS TEAM'S COHORT */}
                        {/* ================================================= */}

                        <div className="border-t border-[var(--color-border-default)] pt-6">

                            <div className="mb-3">
                                <h4 className="text-sm font-extrabold">
                                    Add Fellows from Cohort
                                </h4>

                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    Only Fellows enrolled in this Team&apos;s Cohort are shown.
                                </p>
                            </div>

                            {availableFellows.length === 0 ? (
                                <div className="rounded-xl border border-[var(--color-border-default)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                                    No additional Fellows are available from this Cohort.
                                </div>
                            ) : (
                                <div className="space-y-3">

                                    {availableFellows.map(
                                        (fellow) => (
                                            <div
                                                key={fellow.fellow_id}
                                                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border-default)] p-4"
                                            >

                                                <div>
                                                    <div className="text-sm font-bold">
                                                        {fellow.first_name}{" "}
                                                        {fellow.last_name}
                                                    </div>

                                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                        {fellow.email}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        savingUserId ===
                                                        fellow.fellow_id
                                                    }
                                                    onClick={() =>
                                                        handleAddFellow(
                                                            fellow.fellow_id
                                                        )
                                                    }
                                                    className="px-3 py-1.5 rounded-lg bg-[var(--color-brand-blue)] text-white text-xs font-bold disabled:opacity-50"
                                                >
                                                    {savingUserId ===
                                                        fellow.fellow_id
                                                        ? "Adding..."
                                                        : "Add to Team"}
                                                </button>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}
                        </div>

                    </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border text-xs font-bold"
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
}