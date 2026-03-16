---
name: finding-list
description: "Quick shortcut to list open Planboard findings. Same as `/finding list`."
user_invocable: true
---

Call the `list_findings` MCP tool to show all findings with status `draft` or `open`.

1. Determine space and project from context (current directory, CLAUDE.md, or ask user)
2. Call `list_findings` with no status filter
3. Group results by status: first `open`, then `draft`, then `in_progress`
4. Display as a compact table with title, priority, status, and tags
5. Show counts per status at the end

If there are no open findings, say so briefly.
