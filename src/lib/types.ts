export interface Space {
  id: string;
  name: string;
  projectCount: number;
  createdAt: string;
}

export interface Project {
  id: string;
  spaceId: string;
  name: string;
  slug: string;
  description: string;
  planCount: number;
  findingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanMeta {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan extends PlanMeta {
  content: string;
}

export interface PlanComment {
  id: string;
  planId: string;
  author: Profile | null;
  content: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  createdAt: string;
}

export type FindingStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "resolved"
  | "dismissed";

export type FindingPriority = "low" | "medium" | "high" | "critical";

export interface FindingComment {
  id: string;
  findingId: string;
  author: Profile | null;
  content: string;
  createdAt: string;
}

export interface Finding {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: FindingStatus;
  priority: FindingPriority;
  tags: string[];
  assignee: Profile | null;
  createdAt: string;
  updatedAt: string;
}
