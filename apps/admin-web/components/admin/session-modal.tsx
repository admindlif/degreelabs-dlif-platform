"use client";

import * as React from "react";

import {
  AdminCohort,
  AdminPhase,
  AdminSession,
  AdminWeek,
  createSession,
  updateSession,
} from "@/lib/api/admin";

interface SessionModalProps {
  session?: AdminSession | null;
  cohorts: AdminCohort[];
  phases: AdminPhase[];
  weeks: AdminWeek[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function SessionModal({
  session,
  cohorts,
  phases,
  weeks,
  onClose,
  onSaved,
}: SessionModalProps) {
  const isEdit = Boolean(session);

  const [cohortId, setCohortId] = React.useState(
    session?.cohort_id ?? cohorts[0]?.id ?? ""
  );

  const [phaseId, setPhaseId] = React.useState(
    session?.phase_id ?? phases[0]?.id ?? ""
  );

  const [weekId, setWeekId] = React.useState(
    session?.week_id ?? ""
  );

  const [sessionNumber, setSessionNumber] = React.useState(
    session?.session_number ?? 0
  );

  const [sessionType, setSessionType] = React.useState(
    session?.session_type ?? "learn_work"
  );

  const [title, setTitle] = React.useState(
    session?.title ?? ""
  );

  const [description, setDescription] = React.useState(
    session?.description ?? ""
  );

  const [startAt, setStartAt] = React.useState(
    session?.start_at
      ? new Date(session.start_at).toISOString().slice(0, 16)
      : ""
  );

  const [endAt, setEndAt] = React.useState(
    session?.end_at
      ? new Date(session.end_at).toISOString().slice(0, 16)
      : ""
  );


  const [recordingUrl, setRecordingUrl] = React.useState(
    session?.recording_url ?? ""
  );

  const [status, setStatus] = React.useState(
    session?.status ?? "scheduled"
  );

  const [sequence, setSequence] = React.useState(
    session?.sequence ?? 0
  );

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filteredWeeks = weeks.filter(
    (week) => week.phase_id === phaseId
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError(null);

    try {
      if (isEdit && session) {
        await updateSession(session.id, {
          week_id: weekId || null,
          session_number: Number(sessionNumber),
          session_type: sessionType,
          title: title.trim(),
          description: description.trim() || undefined,
          start_at: startAt
            ? new Date(startAt).toISOString()
            : undefined,
          end_at: endAt
            ? new Date(endAt).toISOString()
            : undefined,
          recording_url: recordingUrl.trim() || undefined,
          status,
          sequence: Number(sequence),
        });
      } else {
        await createSession({
          cohort_id: cohortId,
          phase_id: phaseId,
          week_id: weekId || null,
          session_number: Number(sessionNumber),
          session_type: sessionType,
          title: title.trim(),
          description: description.trim() || undefined,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          recording_url: recordingUrl.trim() || undefined,
          status,
          sequence: Number(sequence),
        });
      }
      await onSaved();
    } catch (err: any) {
      setError(err?.message || "Unable to save session.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold">
              {isEdit ? "Edit Session" : "Create Session"}
            </h3>

            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Create and schedule a Fellowship session.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">

          <div>
            <label className="block text-xs font-bold mb-1">
              Cohort *
            </label>

            <select
              required
              disabled={isEdit}
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
            >
              <option value="">Select Cohort</option>

              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Phase *
            </label>

            <select
              required
              disabled={isEdit}
              value={phaseId}
              onChange={(e) => {
                setPhaseId(e.target.value);
                setWeekId("");
              }}
              className="w-full px-3 py-2.5 rounded-xl border"
            >
              <option value="">Select Phase</option>

              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name} ({phase.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Week
            </label>

            <select
              value={weekId}
              onChange={(e) => setWeekId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
            >
              <option value="">
                No Week / Session 0
              </option>

              {filteredWeeks.map((week) => (
                <option key={week.id} value={week.id}>
                  Week {week.week_number} — {week.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                Session Number *
              </label>

              <input
                type="number"
                min={0}
                required
                value={sessionNumber}
                onChange={(e) =>
                  setSessionNumber(Number(e.target.value))
                }
                className="w-full px-3 py-2.5 rounded-xl border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Sequence *
              </label>

              <input
                type="number"
                min={0}
                required
                value={sequence}
                onChange={(e) =>
                  setSequence(Number(e.target.value))
                }
                className="w-full px-3 py-2.5 rounded-xl border"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Session Type
            </label>

            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
            >
              <option value="induction">Induction</option>
              <option value="learn_work">Learn + Work</option>
              <option value="output_review">
                Output + Review
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Session Title *
            </label>

            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Problem Framing & Diagnosis"
              className="w-full px-3 py-2.5 rounded-xl border"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                End Date & Time
              </label>

              <input
                type="datetime-local"
                required
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Recording URL
            </label>

            <input
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2.5 rounded-xl border"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !cohortId ||
              !phaseId ||
              !title.trim() ||
              !startAt ||
              !endAt
            }
            className="px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-bold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
}