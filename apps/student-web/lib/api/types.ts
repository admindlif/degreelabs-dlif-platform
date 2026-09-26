export interface FellowUserSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface ProgramSummary {
  id: string;
  name: string;
  code: string;
}

export interface CohortSummary {
  id: string;
  name: string;
  code: string;
  status: string;
}

export interface PhaseSummary {
  id: string;
  code: string;
  name: string;
  development_role: string;
  sequence: number;
}

export interface FellowContext {
  fellow: FellowUserSummary;
  program: ProgramSummary;
  cohort: CohortSummary;
  current_phase: PhaseSummary;
}

export interface SessionSummary {
  id: string;
  session_number: number;

  session_type:
  | "induction"
  | "learn_work"
  | "output_review"
  | string
  | null;

  title: string;
  description: string | null;

  start_at: string | null;
  end_at: string | null;
  unlock_at: string | null;

  is_unlocked: boolean;
  submission_enabled: boolean;

  meeting_url: string | null;
  recording_url: string | null;
  transcript_url: string | null;

  status:
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | "locked"
  | string;

  sequence: number;

  has_recording: boolean;
  has_transcript: boolean;
}

export interface DiscoverProgress {
  current_week: number;
  total_weeks: number;
  percentage: number;
  completed_sessions: number;
  total_sessions: number;
}

export interface DiscoverOverview {
  phase: PhaseSummary;
  cohort: CohortSummary;
  progress: DiscoverProgress;
  next_session: SessionSummary | null;
}

export interface DiscoverWeek {
  id: string;
  week_number: number;
  title: string;
  strategic_question: string | null;
  description: string | null;
  sequence: number;
  status: "active" | "upcoming" | "locked" | "completed" | string;
  status_badge: string;
  sessions: SessionSummary[];
}

export interface SessionDetail extends SessionSummary {
  cohort_id: string;
  phase_id: string;
  week_id: string | null;
  week_title: string | null;
  week_number: number | null;
}

// --- Milestone 2: Team & Resources ---

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  initials: string;
  team_role: "lead" | "member" | string;
}

export interface FellowTeam {
  id: string;
  name: string;
  company_challenge: string | null;
  company_name: string | null;
  member_count: number;
  members: TeamMember[];
}

export interface PhaseResource {
  id: string;
  title: string;
  subtitle: string | null;
  resource_type: "handbook" | "rubric" | "template" | "guide" | "link" | string;
  url: string | null;
  is_downloadable: boolean;
  sequence: number;
}

