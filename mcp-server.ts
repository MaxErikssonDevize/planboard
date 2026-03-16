import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.PLANBOARD_URL || "http://localhost:3000";

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "planboard",
  version: "0.1.0",
});

server.tool("list_spaces", "List all spaces", {}, async () => {
  const spaces = await api("/api/spaces");
  return { content: [{ type: "text", text: JSON.stringify(spaces, null, 2) }] };
});

server.tool(
  "list_projects",
  "List all projects in a space",
  { space: z.string().describe("Space name") },
  async ({ space }) => {
    const projects = await api(`/api/spaces/${space}/projects`);
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
    };
  },
);

server.tool(
  "list_plans",
  "List all plans in a project",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
  },
  async ({ space, project }) => {
    const plans = await api(
      `/api/spaces/${space}/projects/${project}/plans`,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(plans, null, 2) }],
    };
  },
);

server.tool(
  "read_plan",
  "Read a plan's content",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    slug: z.string().describe("Plan slug"),
  },
  async ({ space, project, slug }) => {
    const plan = await api(
      `/api/spaces/${space}/projects/${project}/plans/${slug}`,
    );
    const comments = await api(`/api/plans/${plan.id}/comments`);
    const parts = [plan.content];
    if (Array.isArray(comments) && comments.length > 0) {
      parts.push("\n\n---\n## Kommentarer\n");
      for (const c of comments) {
        const author = c.author?.name || "Anonym";
        const date = new Date(c.createdAt).toLocaleString("sv");
        parts.push(`**${author}** (${date}):\n${c.content}\n`);
      }
    }
    return {
      content: [{ type: "text", text: parts.join("\n") }],
    };
  },
);

server.tool(
  "write_plan",
  "Create or update a plan",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    slug: z.string().optional().describe("Plan slug (omit to create new)"),
    content: z.string().describe("Markdown content"),
    title: z.string().optional().describe("Plan title (optional)"),
  },
  async ({ space, project, slug, content, title }) => {
    let plan;
    if (slug) {
      // Update existing
      plan = await api(
        `/api/spaces/${space}/projects/${project}/plans/${slug}`,
        {
          method: "PUT",
          body: JSON.stringify({ content, title }),
        },
      );
    } else {
      // Create new
      plan = await api(
        `/api/spaces/${space}/projects/${project}/plans`,
        {
          method: "POST",
          body: JSON.stringify({ content, title: title || "Namnlös plan" }),
        },
      );
    }
    return {
      content: [
        {
          type: "text",
          text: `Plan saved: ${space}/${project}/${plan.slug} (${plan.title})`,
        },
      ],
    };
  },
);

server.tool(
  "delete_plan",
  "Delete a plan",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    slug: z.string().describe("Plan slug"),
  },
  async ({ space, project, slug }) => {
    await api(
      `/api/spaces/${space}/projects/${project}/plans/${slug}`,
      { method: "DELETE" },
    );
    return {
      content: [
        { type: "text", text: `Plan deleted: ${space}/${project}/${slug}` },
      ],
    };
  },
);

// --- Findings ---

server.tool(
  "list_findings",
  "List findings in a project, optionally filtered by status",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    status: z
      .enum(["draft", "open", "in_progress", "resolved", "dismissed"])
      .optional()
      .describe("Filter by status"),
  },
  async ({ space, project, status }) => {
    const query = status ? `?status=${status}` : "";
    const list = await api(
      `/api/spaces/${space}/projects/${project}/findings${query}`,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  },
);

server.tool(
  "read_finding",
  "Read a finding with its comments",
  {
    id: z.string().describe("Finding ID"),
  },
  async ({ id }) => {
    const finding = await api(`/api/findings/${id}`);
    const comments = await api(`/api/findings/${id}/comments`);
    const parts = [
      `# ${finding.title}`,
      `**Status:** ${finding.status} | **Prioritet:** ${finding.priority}`,
      finding.assignee ? `**Tilldelad:** ${finding.assignee.name}` : "",
      finding.tags?.length ? `**Taggar:** ${finding.tags.join(", ")}` : "",
      "",
      finding.description || "*Ingen beskrivning*",
    ];
    if (Array.isArray(comments) && comments.length > 0) {
      parts.push("\n---\n## Kommentarer\n");
      for (const c of comments) {
        const author = c.author?.name || "Anonym";
        const date = new Date(c.createdAt).toLocaleString("sv");
        parts.push(`**${author}** (${date}):\n${c.content}\n`);
      }
    }
    return {
      content: [{ type: "text", text: parts.filter(Boolean).join("\n") }],
    };
  },
);

server.tool(
  "comment_on_finding",
  "Add a comment to a finding",
  {
    id: z.string().describe("Finding ID"),
    content: z.string().describe("Comment content (markdown)"),
    authorId: z.string().optional().describe("Profile ID of the author"),
  },
  async ({ id, content, authorId }) => {
    const comment = await api(`/api/findings/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, authorId }),
    });
    const author = comment.author?.name || "Anonym";
    return {
      content: [
        {
          type: "text",
          text: `Comment added by ${author} on finding ${id}`,
        },
      ],
    };
  },
);

server.tool(
  "comment_on_plan",
  "Add a comment to a plan",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    slug: z.string().describe("Plan slug"),
    content: z.string().describe("Comment content (markdown)"),
    authorId: z.string().optional().describe("Profile ID of the author"),
  },
  async ({ space, project, slug, content, authorId }) => {
    // Get plan ID from slug
    const plan = await api(
      `/api/spaces/${space}/projects/${project}/plans/${slug}`,
    );
    const comment = await api(`/api/plans/${plan.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, authorId }),
    });
    const author = comment.author?.name || "Anonym";
    return {
      content: [
        {
          type: "text",
          text: `Comment added by ${author} on plan ${space}/${project}/${slug}`,
        },
      ],
    };
  },
);

server.tool(
  "create_finding",
  "Create a new finding (discovery, issue, note) in a project",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    title: z.string().describe("Finding title"),
    description: z.string().optional().describe("Detailed description"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .describe("Priority level (default: medium)"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags for categorization"),
  },
  async ({ space, project, title, description, priority, tags }) => {
    const finding = await api(
      `/api/spaces/${space}/projects/${project}/findings`,
      {
        method: "POST",
        body: JSON.stringify({ title, description, priority, tags }),
      },
    );
    return {
      content: [
        {
          type: "text",
          text: `Finding created: "${finding.title}" [${finding.priority}] (${finding.id})`,
        },
      ],
    };
  },
);

server.tool(
  "update_finding",
  "Update a finding's status, priority, or details",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    id: z.string().describe("Finding ID"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    status: z
      .enum(["draft", "open", "in_progress", "resolved", "dismissed"])
      .optional()
      .describe("New status"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .describe("New priority"),
    tags: z.array(z.string()).optional().describe("New tags"),
  },
  async ({ space, project, id, ...updates }) => {
    const finding = await api(
      `/api/spaces/${space}/projects/${project}/findings/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
    );
    return {
      content: [
        {
          type: "text",
          text: `Finding updated: "${finding.title}" → ${finding.status} [${finding.priority}]`,
        },
      ],
    };
  },
);

server.tool(
  "delete_finding",
  "Delete a finding",
  {
    space: z.string().describe("Space name"),
    project: z.string().describe("Project slug"),
    id: z.string().describe("Finding ID"),
  },
  async ({ space, project, id }) => {
    await api(
      `/api/spaces/${space}/projects/${project}/findings/${id}`,
      { method: "DELETE" },
    );
    return {
      content: [{ type: "text", text: `Finding deleted: ${id}` }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
