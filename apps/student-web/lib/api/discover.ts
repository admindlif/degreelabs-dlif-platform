import { apiClient } from "./client";
import { DiscoverOverview, DiscoverWeek, SessionDetail } from "./types";

export async function getDiscoverOverview(): Promise<DiscoverOverview> {
  return apiClient<DiscoverOverview>("/api/v1/fellow/discover/overview");
}

export async function getDiscoverWeeks(): Promise<DiscoverWeek[]> {
  return apiClient<DiscoverWeek[]>("/api/v1/fellow/discover/weeks");
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  return apiClient<SessionDetail>(`/api/v1/fellow/sessions/${sessionId}`);
}
