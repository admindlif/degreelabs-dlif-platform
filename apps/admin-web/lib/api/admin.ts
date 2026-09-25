import { adminApiClient } from "./client";

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

export interface AdminCohort {
  id: string;
  name: string;
  code: string;
  start_date: string | null;
  status: string;
  participant_count: number;
}

export interface AdminTeam {
  id: string;
  name: string;
  company_challenge: string;
  member_count: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  return adminApiClient<AdminStats>("/api/v1/admin/stats");
}

export async function getAdminFellows(): Promise<AdminFellow[]> {
  return adminApiClient<AdminFellow[]>("/api/v1/admin/fellows");
}

export async function getAdminCohorts(): Promise<AdminCohort[]> {
  return adminApiClient<AdminCohort[]>("/api/v1/admin/cohorts");
}

export async function getAdminTeams(): Promise<AdminTeam[]> {
  return adminApiClient<AdminTeam[]>("/api/v1/admin/teams");
}

export async function inviteFellow(data: {
  first_name: string;
  last_name: string;
  email: string;
}): Promise<any> {
  return adminApiClient("/api/v1/admin/fellows", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
