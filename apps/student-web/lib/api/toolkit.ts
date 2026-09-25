import { apiClient } from "./client";
import { FellowTeam, PhaseResource } from "./types";

export async function getFellowTeam(): Promise<FellowTeam> {
  return apiClient<FellowTeam>("/api/v1/fellow/team");
}

export async function getFellowResources(): Promise<PhaseResource[]> {
  return apiClient<PhaseResource[]>("/api/v1/fellow/resources");
}
