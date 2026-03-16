---
name: finding
description: "Manage Planboard findings: create draft items, list open items, or grab and convert to active work. Usage: `/finding` (create), `/finding list` (show open), `/finding grab <title>` (start working)."
user_invocable: true
---

# Planboard Finding Manager

You have access to the Planboard MCP server with these tools:
- `list_findings` — list findings (can filter by status)
- `create_finding` — create a new finding
- `update_finding` — update status/priority/details
- `delete_finding` — delete a finding

## Determine the action from args

Parse `$ARGUMENTS` to determine what the user wants:

### No args or descriptive text → CREATE

The user wants to create a finding. If they provided descriptive text, use it to fill in the fields intelligently.

1. Determine the **space** and **project** from context:
   - Check if there's a CLAUDE.md or project config that specifies a default space/project
   - Look at the current working directory name for hints
   - If unclear, ask the user which space and project to use

2. Create the finding using `create_finding` with:
   - **title**: Short, clear summary (max ~80 chars)
   - **description**: Detailed markdown description. Include:
     - What was found
     - Where in the codebase (file paths, line numbers)
     - Why it matters
     - Suggested approach if obvious
   - **priority**: Infer from context (default: medium)
     - `critical` — security issues, data loss risks, production blockers
     - `high` — bugs affecting users, broken functionality
     - `medium` — tech debt, improvements, non-urgent issues
     - `low` — nice-to-haves, cosmetic issues, minor cleanup
   - **tags**: Infer relevant tags (e.g., `security`, `performance`, `tech-debt`, `bug`, `ux`, `refactor`)

3. Confirm creation with a brief summary.

### `list` → LIST

1. Call `list_findings` with status filter if provided (e.g., `/finding list open`)
2. If no status specified, show findings with status `draft` or `open`
3. Display as a compact table:
   ```
   | # | Title | Priority | Status | Tags |
   ```
4. Show total count at the end.

### `grab <title>` → GRAB (pick up a finding)

1. Call `list_findings` to find a matching finding by title (fuzzy match)
2. If found, call `update_finding` to set status to `in_progress`
3. Display the finding's full description so the user has context
4. Suggest next steps based on the finding's description

### `resolve <title>` → RESOLVE

1. Find the matching finding
2. Update status to `resolved`
3. Confirm resolution

### `dismiss <title>` → DISMISS

1. Find the matching finding
2. Update status to `dismissed`
3. Confirm dismissal

## Important

- Always be concise in confirmations — the user knows what they asked for
- When creating from context mid-conversation, capture the relevant details the AI discovered
- Use markdown in descriptions for readability (code blocks, lists, bold)
- Don't ask for confirmation before creating — just create it and show the result
