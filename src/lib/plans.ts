import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { spaces, projects, plans, findings, profiles, findingComments, planComments } from "./db/schema";
import { slugify } from "./slugify";
import type {
  PlanComment,
  FindingComment,
  Space,
  Project,
  PlanMeta,
  Plan,
  Profile,
  Finding,
  FindingStatus,
  FindingPriority,
} from "./types";

// --- Spaces ---

export async function listSpaces(): Promise<Space[]> {
  const rows = await db
    .select({
      id: spaces.id,
      name: spaces.name,
      createdAt: spaces.createdAt,
      projectCount: sql<number>`(
        select count(*)::int from "projects" where "projects"."space_id" = "spaces"."id"
      )`,
    })
    .from(spaces)
    .orderBy(spaces.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    projectCount: r.projectCount,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createSpace(name: string): Promise<Space> {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) throw new Error("Namn krävs");

  const [row] = await db
    .insert(spaces)
    .values({ name: trimmed })
    .returning();

  return {
    id: row.id,
    name: row.name,
    projectCount: 0,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteSpace(name: string): Promise<void> {
  const space = await getSpaceByName(name);
  if (!space) throw new Error("Space ej hittat");
  // Cascade deletes projects and plans via FK
  await db.delete(spaces).where(eq(spaces.id, space.id));
}

export async function getSpaceByName(name: string) {
  const [row] = await db
    .select()
    .from(spaces)
    .where(eq(spaces.name, name))
    .limit(1);
  return row ?? null;
}

// --- Projects ---

export async function listProjects(spaceName: string): Promise<Project[]> {
  const space = await getSpaceByName(spaceName);
  if (!space) throw new Error("Space ej hittat");

  const rows = await db
    .select({
      id: projects.id,
      spaceId: projects.spaceId,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      planCount: sql<number>`(
        select count(*)::int from "plans" where "plans"."project_id" = "projects"."id"
      )`,
      findingCount: sql<number>`(
        select count(*)::int from "findings" where "findings"."project_id" = "projects"."id"
      )`,
    })
    .from(projects)
    .where(eq(projects.spaceId, space.id))
    .orderBy(desc(projects.updatedAt));

  return rows.map((r) => ({
    id: r.id,
    spaceId: r.spaceId,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    planCount: r.planCount,
    findingCount: r.findingCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createProject(
  spaceName: string,
  name: string,
  description?: string,
): Promise<Project> {
  const space = await getSpaceByName(spaceName);
  if (!space) throw new Error("Space ej hittat");

  const trimmed = name.trim().slice(0, 200);
  if (!trimmed) throw new Error("Namn krävs");

  const slug = slugify(trimmed);

  const [row] = await db
    .insert(projects)
    .values({
      spaceId: space.id,
      name: trimmed,
      slug,
      description: description || "",
    })
    .returning();

  return {
    id: row.id,
    spaceId: row.spaceId,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    planCount: 0,
    findingCount: 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteProject(
  spaceName: string,
  projectSlug: string,
): Promise<void> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");
  // Cascade deletes plans via FK
  await db.delete(projects).where(eq(projects.id, project.id));
}

async function getProject(spaceName: string, projectSlug: string) {
  const space = await getSpaceByName(spaceName);
  if (!space) return null;

  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.spaceId, space.id), eq(projects.slug, projectSlug)),
    )
    .limit(1);

  return row ?? null;
}

// --- Plans ---

export async function listPlans(
  spaceName: string,
  projectSlug: string,
): Promise<PlanMeta[]> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const rows = await db
    .select({
      id: plans.id,
      projectId: plans.projectId,
      slug: plans.slug,
      title: plans.title,
      createdAt: plans.createdAt,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .where(eq(plans.projectId, project.id))
    .orderBy(desc(plans.updatedAt));

  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    slug: r.slug,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function readPlan(
  spaceName: string,
  projectSlug: string,
  planSlug: string,
): Promise<Plan> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const [row] = await db
    .select()
    .from(plans)
    .where(
      and(eq(plans.projectId, project.id), eq(plans.slug, planSlug)),
    )
    .limit(1);

  if (!row) throw new Error("Plan ej hittad");

  return {
    id: row.id,
    projectId: row.projectId,
    slug: row.slug,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function extractTitle(content: string): string {
  const firstLine = content.split("\n")[0] || "";
  const match = firstLine.match(/^#\s+(.+)/);
  return match ? match[1].trim() : "Namnlös plan";
}

export async function writePlan(
  spaceName: string,
  projectSlug: string,
  planSlug: string | undefined,
  content: string,
  title?: string,
): Promise<Plan> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const finalTitle = title || extractTitle(content) || "Namnlös plan";
  const finalSlug = planSlug || slugify(finalTitle);

  let finalContent = content;
  if (!content.trimStart().startsWith("# ")) {
    finalContent = `# ${finalTitle}\n\n${content}`;
  }

  // Upsert: insert or update on conflict
  const existing = await db
    .select()
    .from(plans)
    .where(
      and(eq(plans.projectId, project.id), eq(plans.slug, finalSlug)),
    )
    .limit(1);

  let row;
  if (existing.length > 0) {
    [row] = await db
      .update(plans)
      .set({
        title: finalTitle,
        content: finalContent,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(plans)
      .values({
        projectId: project.id,
        title: finalTitle,
        slug: finalSlug,
        content: finalContent,
      })
      .returning();
  }

  return {
    id: row.id,
    projectId: row.projectId,
    slug: row.slug,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deletePlan(
  spaceName: string,
  projectSlug: string,
  planSlug: string,
): Promise<void> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const result = await db
    .delete(plans)
    .where(
      and(eq(plans.projectId, project.id), eq(plans.slug, planSlug)),
    )
    .returning();

  if (result.length === 0) throw new Error("Plan ej hittad");
}

// --- Plan Comments ---

export async function listPlanComments(planId: string): Promise<PlanComment[]> {
  const rows = await db
    .select({
      comment: planComments,
      author: profiles,
    })
    .from(planComments)
    .leftJoin(profiles, eq(planComments.authorId, profiles.id))
    .where(eq(planComments.planId, planId))
    .orderBy(planComments.createdAt);

  return rows.map((r) => ({
    id: r.comment.id,
    planId: r.comment.planId,
    author: r.author ? toProfile(r.author) : null,
    content: r.comment.content,
    createdAt: r.comment.createdAt.toISOString(),
  }));
}

export async function addPlanComment(
  planId: string,
  content: string,
  authorId?: string,
): Promise<PlanComment> {
  const [row] = await db
    .insert(planComments)
    .values({
      planId,
      content,
      authorId: authorId || null,
    })
    .returning();

  const author = await getProfileById(row.authorId);
  return {
    id: row.id,
    planId: row.planId,
    author,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deletePlanComment(commentId: string): Promise<void> {
  const result = await db
    .delete(planComments)
    .where(eq(planComments.id, commentId))
    .returning();
  if (result.length === 0) throw new Error("Kommentar ej hittad");
}

// --- Profiles ---

function toProfile(row: typeof profiles.$inferSelect): Profile {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProfiles(): Promise<Profile[]> {
  const rows = await db.select().from(profiles).orderBy(profiles.name);
  return rows.map(toProfile);
}

export async function createProfile(
  name: string,
  emoji?: string,
): Promise<Profile> {
  const trimmed = name.trim().slice(0, 100);
  if (!trimmed) throw new Error("Namn krävs");

  const slug = slugify(trimmed);
  const [row] = await db
    .insert(profiles)
    .values({ name: trimmed, slug, emoji: emoji || "" })
    .returning();

  return toProfile(row);
}

export async function deleteProfile(id: string): Promise<void> {
  const result = await db
    .delete(profiles)
    .where(eq(profiles.id, id))
    .returning();
  if (result.length === 0) throw new Error("Profil ej hittad");
}

// --- Findings ---

async function getProfileById(
  id: string | null,
): Promise<Profile | null> {
  if (!id) return null;
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return row ? toProfile(row) : null;
}

function toFindingBase(row: typeof findings.$inferSelect): Omit<Finding, "assignee"> {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description ?? "",
    status: row.status as FindingStatus,
    priority: row.priority as FindingPriority,
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFindings(
  spaceName: string,
  projectSlug: string,
  status?: FindingStatus,
): Promise<Finding[]> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const conditions = [eq(findings.projectId, project.id)];
  if (status) conditions.push(eq(findings.status, status));

  const rows = await db
    .select({
      finding: findings,
      profile: profiles,
    })
    .from(findings)
    .leftJoin(profiles, eq(findings.assigneeId, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(findings.createdAt));

  return rows.map((r) => ({
    ...toFindingBase(r.finding),
    assignee: r.profile ? toProfile(r.profile) : null,
  }));
}

export async function createFinding(
  spaceName: string,
  projectSlug: string,
  data: {
    title: string;
    description?: string;
    status?: FindingStatus;
    priority?: FindingPriority;
    tags?: string[];
    assigneeId?: string;
  },
): Promise<Finding> {
  const project = await getProject(spaceName, projectSlug);
  if (!project) throw new Error("Projekt ej hittat");

  const [row] = await db
    .insert(findings)
    .values({
      projectId: project.id,
      title: data.title.trim().slice(0, 500),
      description: data.description || "",
      status: data.status || "draft",
      priority: data.priority || "medium",
      tags: data.tags?.join(",") || "",
      assigneeId: data.assigneeId || null,
    })
    .returning();

  const assignee = await getProfileById(row.assigneeId);
  return { ...toFindingBase(row), assignee };
}

export async function updateFinding(
  findingId: string,
  data: {
    title?: string;
    description?: string;
    status?: FindingStatus;
    priority?: FindingPriority;
    tags?: string[];
    assigneeId?: string | null;
  },
): Promise<Finding> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title.trim().slice(0, 500);
  if (data.description !== undefined) updates.description = data.description;
  if (data.status !== undefined) updates.status = data.status;
  if (data.priority !== undefined) updates.priority = data.priority;
  if (data.tags !== undefined) updates.tags = data.tags.join(",");
  if (data.assigneeId !== undefined) updates.assigneeId = data.assigneeId;

  const [row] = await db
    .update(findings)
    .set(updates)
    .where(eq(findings.id, findingId))
    .returning();

  if (!row) throw new Error("Finding ej hittad");
  const assignee = await getProfileById(row.assigneeId);
  return { ...toFindingBase(row), assignee };
}

export async function deleteFinding(findingId: string): Promise<void> {
  const result = await db
    .delete(findings)
    .where(eq(findings.id, findingId))
    .returning();

  if (result.length === 0) throw new Error("Finding ej hittad");
}

// --- Finding Comments ---

export async function listComments(findingId: string): Promise<FindingComment[]> {
  const rows = await db
    .select({
      comment: findingComments,
      author: profiles,
    })
    .from(findingComments)
    .leftJoin(profiles, eq(findingComments.authorId, profiles.id))
    .where(eq(findingComments.findingId, findingId))
    .orderBy(findingComments.createdAt);

  return rows.map((r) => ({
    id: r.comment.id,
    findingId: r.comment.findingId,
    author: r.author ? toProfile(r.author) : null,
    content: r.comment.content,
    createdAt: r.comment.createdAt.toISOString(),
  }));
}

export async function addComment(
  findingId: string,
  content: string,
  authorId?: string,
): Promise<FindingComment> {
  const [row] = await db
    .insert(findingComments)
    .values({
      findingId,
      content,
      authorId: authorId || null,
    })
    .returning();

  const author = await getProfileById(row.authorId);
  return {
    id: row.id,
    findingId: row.findingId,
    author,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteComment(commentId: string): Promise<void> {
  const result = await db
    .delete(findingComments)
    .where(eq(findingComments.id, commentId))
    .returning();
  if (result.length === 0) throw new Error("Kommentar ej hittad");
}

export async function getFinding(findingId: string): Promise<Finding> {
  const [row] = await db
    .select({
      finding: findings,
      profile: profiles,
    })
    .from(findings)
    .leftJoin(profiles, eq(findings.assigneeId, profiles.id))
    .where(eq(findings.id, findingId))
    .limit(1);

  if (!row) throw new Error("Finding ej hittad");
  return {
    ...toFindingBase(row.finding),
    assignee: row.profile ? toProfile(row.profile) : null,
  };
}
