import { adminApiClient } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminStats {
  total_fellows: number;
  active_fellows: number;
  invited_fellows: number;
  total_cohorts: number;
  total_teams: number;
  total_sessions: number;
  current_phase: string;
  week: string;
}

export interface AdminFellow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  account_status: string;
  two_factor_enabled: boolean;
  created_at: string | null;
  last_login_at: string | null;
}

export interface FellowUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  account_status?: string;
  role?: string;
  two_factor_enabled?: boolean;
}

export interface AdminProgram {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface ProgramCreate {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

export interface AdminCohort {
  id: string;
  program_id: string;
  name: string;
  code: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  participant_count: number;
}

export interface CohortCreate {
  program_id: string;
  name: string;
  code: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface AdminPhase {
  id: string;
  program_id: string;
  code: string;
  name: string;
  development_role: string;
  sequence: number;
  description: string | null;
  duration_weeks: number;
  is_active: boolean;
}

export interface AdminWeek {
  id: string;
  phase_id: string;
  week_number: number;
  title: string;
  strategic_question: string | null;
  description: string | null;
  sequence: number;
  unlock_at: string | null;
}

export interface WeekCreate {
  phase_id: string;
  week_number: number;
  title: string;
  strategic_question?: string;
  description?: string;
  sequence: number;
  unlock_at?: string;
}

export interface AdminSession {
  id: string;
  cohort_id: string;
  phase_id: string;
  week_id: string | null;
  session_number: number;
  session_type: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  meeting_url: string | null;
  recording_url: string | null;
  status: string;
  sequence: number;
}

export interface SessionCreate {
  cohort_id: string;
  phase_id: string;
  week_id?: string;
  session_number: number;
  session_type?: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  meeting_url?: string;
  status?: string;
  sequence: number;
}

export interface AdminTeam {
  id: string;
  cohort_id: string;
  name: string;
  company_challenge: string | null;
  company_name: string | null;
  is_active: boolean;
  member_count: number;
}

export interface TeamCreate {
  cohort_id: string;
  name: string;
  company_challenge?: string;
  company_name?: string;
  is_active?: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_role: string;
  joined_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface TeamDetail extends AdminTeam {
  members: TeamMember[];
}

export interface AdminResource {
  id: string;
  phase_id: string;
  title: string;
  subtitle: string | null;
  resource_type: string;
  url: string | null;
  is_downloadable: boolean;
  is_active: boolean;
  sequence: number;
}

export interface ResourceCreate {
  phase_id: string;
  title: string;
  subtitle?: string;
  resource_type?: string;
  url?: string;
  is_downloadable?: boolean;
  is_active?: boolean;
  sequence?: number;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getAdminStats(): Promise<AdminStats> {
  return adminApiClient<AdminStats>("/api/v1/admin/stats");
}

// ---------------------------------------------------------------------------
// Fellows
// ---------------------------------------------------------------------------

export async function getAdminFellows(): Promise<AdminFellow[]> {
  return adminApiClient<AdminFellow[]>("/api/v1/admin/fellows");
}

export async function getAdminFellow(id: string): Promise<AdminFellow> {
  return adminApiClient<AdminFellow>(`/api/v1/admin/fellows/${id}`);
}

export async function inviteFellow(data: { first_name: string; last_name: string; email: string }): Promise<any> {
  return adminApiClient("/api/v1/admin/fellows", { method: "POST", body: JSON.stringify(data) });
}

export async function updateFellow(id: string, data: FellowUpdate): Promise<AdminFellow> {
  return adminApiClient<AdminFellow>(`/api/v1/admin/fellows/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteFellow(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/fellows/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

export async function getAdminPrograms(): Promise<AdminProgram[]> {
  return adminApiClient<AdminProgram[]>("/api/v1/admin/programs");
}

export async function getAdminProgram(id: string): Promise<AdminProgram> {
  return adminApiClient<AdminProgram>(`/api/v1/admin/programs/${id}`);
}

export async function createProgram(data: ProgramCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/programs", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProgram(id: string, data: Partial<ProgramCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteProgram(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/programs/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

export async function getAdminPhases(programId?: string): Promise<AdminPhase[]> {
  const qs = programId ? `?program_id=${programId}` : "";
  return adminApiClient<AdminPhase[]>(`/api/v1/admin/phases${qs}`);
}

export async function getAdminPhase(id: string): Promise<AdminPhase> {
  return adminApiClient<AdminPhase>(`/api/v1/admin/phases/${id}`);
}

export async function updatePhase(id: string, data: Partial<AdminPhase>): Promise<any> {
  return adminApiClient(`/api/v1/admin/phases/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deletePhase(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/phases/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Cohorts
// ---------------------------------------------------------------------------

export async function getAdminCohorts(): Promise<AdminCohort[]> {
  return adminApiClient<AdminCohort[]>("/api/v1/admin/cohorts");
}

export async function getAdminCohort(id: string): Promise<AdminCohort> {
  return adminApiClient<AdminCohort>(`/api/v1/admin/cohorts/${id}`);
}

export async function createCohort(data: CohortCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/cohorts", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCohort(id: string, data: Partial<CohortCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/cohorts/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCohort(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/cohorts/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Weeks
// ---------------------------------------------------------------------------

export async function getAdminWeeks(phaseId?: string): Promise<AdminWeek[]> {
  const qs = phaseId ? `?phase_id=${phaseId}` : "";
  return adminApiClient<AdminWeek[]>(`/api/v1/admin/weeks${qs}`);
}

export async function getAdminWeek(id: string): Promise<AdminWeek> {
  return adminApiClient<AdminWeek>(`/api/v1/admin/weeks/${id}`);
}

export async function createWeek(data: WeekCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/weeks", { method: "POST", body: JSON.stringify(data) });
}

export async function updateWeek(id: string, data: Partial<WeekCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/weeks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteWeek(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/weeks/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function getAdminSessions(cohortId?: string, weekId?: string): Promise<AdminSession[]> {
  const params = new URLSearchParams();
  if (cohortId) params.set("cohort_id", cohortId);
  if (weekId) params.set("week_id", weekId);
  const qs = params.toString() ? `?${params}` : "";
  return adminApiClient<AdminSession[]>(`/api/v1/admin/sessions${qs}`);
}

export async function getAdminSession(id: string): Promise<AdminSession> {
  return adminApiClient<AdminSession>(`/api/v1/admin/sessions/${id}`);
}

export async function createSession(data: SessionCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/sessions", { method: "POST", body: JSON.stringify(data) });
}

export async function updateSession(id: string, data: Partial<SessionCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteSession(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/sessions/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function getAdminTeams(cohortId?: string): Promise<AdminTeam[]> {
  const qs = cohortId ? `?cohort_id=${cohortId}` : "";
  return adminApiClient<AdminTeam[]>(`/api/v1/admin/teams${qs}`);
}

export async function getAdminTeam(id: string): Promise<TeamDetail> {
  return adminApiClient<TeamDetail>(`/api/v1/admin/teams/${id}`);
}

export async function createTeam(data: TeamCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/teams", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTeam(id: string, data: Partial<TeamCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/teams/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteTeam(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/teams/${id}`, { method: "DELETE" });
}

export async function addTeamMember(teamId: string, data: { user_id: string; team_role?: string }): Promise<any> {
  return adminApiClient(`/api/v1/admin/teams/${teamId}/members`, { method: "POST", body: JSON.stringify(data) });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export async function getAdminResources(phaseId?: string): Promise<AdminResource[]> {
  const qs = phaseId ? `?phase_id=${phaseId}` : "";
  return adminApiClient<AdminResource[]>(`/api/v1/admin/resources${qs}`);
}

export async function getAdminResource(id: string): Promise<AdminResource> {
  return adminApiClient<AdminResource>(`/api/v1/admin/resources/${id}`);
}

export async function createResource(data: ResourceCreate): Promise<any> {
  return adminApiClient("/api/v1/admin/resources", { method: "POST", body: JSON.stringify(data) });
}

export async function updateResource(id: string, data: Partial<ResourceCreate>): Promise<any> {
  return adminApiClient(`/api/v1/admin/resources/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteResource(id: string): Promise<void> {
  await adminApiClient(`/api/v1/admin/resources/${id}`, { method: "DELETE" });
}
