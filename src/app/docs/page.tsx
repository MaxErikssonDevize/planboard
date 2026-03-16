"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DocsTabs } from "@/components/docs-tabs";

// --- Section content ---

const overviewContent = `# Planboard

Planboard är ett verktyg för team som jobbar med AI-driven utveckling. Det löser två problem:

1. **Planer** — Skriva, dela och versionshantera planer i markdown som AI-agenter (Claude, Codex) kan läsa och skriva direkt via MCP.
2. **Findings** — Under AI-driven utveckling hittar man saker som inte ska fixas direkt men inte heller glömmas bort. Findings är en lättvikts-tavla per projekt — tänk Jira-kort, fast utan att skräpa ned kundens huvudbräda.

### Typiskt arbetsflöde

1. **Skapa ett utrymme** för dig eller ditt team (t.ex. "max" eller "backend-teamet")
2. **Skapa projekt** per kunduppdrag eller arbetsområde
3. **Skriv planer** i markdown — arkitekturbeslut, roadmaps, specifikationer
4. **Koppla MCP-servern** till Claude Code / Codex så att AI:n kan läsa planer som kontext och skriva tillbaka uppdateringar
5. **Logga findings** under utveckling — saker AI:n eller du hittar som bör hanteras senare. Tilldela till en profil, sätt prioritet, tagga.
6. **Dela planer** med stakeholders via read-only-länk — ingen inloggning krävs

### Vem är det till för?

- **Utvecklare** som jobbar med AI-assistenter och vill ha en central plats för planer
- **Team** som behöver ett enkelt findings-board utan overhead
- **Konsulter** som vill hålla sina findings separata från kundens Jira

## Hierarki

- **Utrymme** — en personlig arbetsyta (t.ex. "max", "teamet")
- **Projekt** — en grupp planer som hör ihop (t.ex. "Q2 Roadmap", "Migration")
- **Plan** — ett markdown-dokument med live-förhandsvisning
- **Finding** — ett kort/ärende som AI eller användare skapar under utveckling
- **Profil** — enkel identitet (namn) för tilldelning — ingen inloggning

## Funktioner

- Skapa och redigera planer i markdown med split-view
- Organisera i utrymmen och projekt
- **Findings board** — lättvikts-ärendehantering per projekt (status, prioritet, taggar, tilldelning)
- **Kommentarer** i markdown på findings
- **Profiler** för att tilldela findings utan inloggning
- Dela planer via publik read-only-länk
- Ladda upp befintliga \`.md\`-filer
- MCP-server för AI-integration (Claude, Codex m.fl.)
- **Claude Code skills** — \`/finding\`, \`/finding list\`, \`/finding grab\`
- REST API
- Docker-deployment

## Teknikstack

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | Next.js 15, React 19, Tailwind 4 |
| Databas | PostgreSQL 17 |
| ORM | Drizzle ORM |
| MCP | @modelcontextprotocol/sdk |
| Markdown | react-markdown + remark-gfm |
| Deploy | Docker (standalone output) |

`;

const setupContent = `# Installation

## Docker (rekommenderat)

\`\`\`bash
git clone <repo-url> planboard
cd planboard
docker compose up -d
\`\`\`

Startar PostgreSQL + Planboard på \`http://localhost:3000\`. Databasen körs i en container och är tillgänglig för alla som har nätverksåtkomst till servern.

## Lokal utveckling

Du behöver inte köra Postgres lokalt — peka på databasen som körs på servern:

\`\`\`bash
# .env
DATABASE_URL=postgres://planboard:planboard@din-server:5432/planboard
\`\`\`

Eller kör en lokal databas:

\`\`\`bash
docker compose up db -d
npm run db:push
npm run dev
\`\`\`

## Första stegen

1. Gå till \`http://localhost:3000\`
2. Skapa en profil under **Profiler** i menyn
3. Skapa ett utrymme (t.ex. "max")
4. Skapa ett projekt inuti utrymmet
5. Skapa planer och findings

Docs-sidan finns på \`http://localhost:3000/docs\`.

## Dela planer

Varje plan har en **Dela**-knapp som kopierar en publik read-only-länk:

\`\`\`
https://din-server.se/dela/{utrymme}/{projekt}/{plan-slug}
\`\`\`

## Ladda upp .md-filer

På projektsidan finns en "Ladda upp .md"-knapp. Titeln plockas automatiskt från den första \`# Rubrik\`-raden i filen.`;

// --- MCP sub-tabs (markdown strings per client) ---

const mcpIntro = `# MCP-server

Planboard inkluderar en **MCP-server** (Model Context Protocol) som gör det möjligt för AI-assistenter att läsa och skriva planer direkt.

## Vad är MCP?

MCP är ett öppet protokoll som låter AI-assistenter ansluta till externa verktyg och datakällor. Istället för att kopiera/klistra in planer kan AI:n läsa, skapa och uppdatera dem direkt.

## Verktyg

| Verktyg | Beskrivning | Parametrar |
|---------|-------------|------------|
| \`list_spaces\` | Lista alla utrymmen | — |
| \`list_projects\` | Lista projekt i ett utrymme | \`space\` |
| \`list_plans\` | Lista planer i ett projekt | \`space\`, \`project\` |
| \`read_plan\` | Läs plan med kommentarer | \`space\`, \`project\`, \`slug\` |
| \`write_plan\` | Skapa eller uppdatera en plan | \`space\`, \`project\`, \`slug?\`, \`content\`, \`title?\` |
| \`delete_plan\` | Radera en plan | \`space\`, \`project\`, \`slug\` |
| \`comment_on_plan\` | Kommentera på en plan | \`space\`, \`project\`, \`slug\`, \`content\`, \`authorId?\` |
| \`list_findings\` | Lista findings i ett projekt | \`space\`, \`project\`, \`status?\` |
| \`read_finding\` | Läs finding med kommentarer | \`id\` |
| \`create_finding\` | Skapa en finding | \`space\`, \`project\`, \`title\`, \`description?\`, \`priority?\`, \`tags?\` |
| \`update_finding\` | Uppdatera en finding | \`space\`, \`project\`, \`id\`, \`status?\`, \`priority?\`, ... |
| \`delete_finding\` | Radera en finding | \`space\`, \`project\`, \`id\` |
| \`comment_on_finding\` | Kommentera på en finding | \`id\`, \`content\`, \`authorId?\` |

## Arkitektur

MCP-servern körs som en fristående Node.js-process och kommunicerar via stdio. Den anropar Planboards REST API via HTTP — ingen direkt databasåtkomst behövs. Databasen är helt inkapslad bakom backend.

## Konfigurera för din klient`;

const mcpClaudeDesktop = `### Claude Desktop

Redigera \`~/Library/Application Support/Claude/claude_desktop_config.json\` (macOS) eller \`%APPDATA%\\Claude\\claude_desktop_config.json\` (Windows):

\`\`\`json
{
  "mcpServers": {
    "planboard": {
      "command": "npx",
      "args": ["tsx", "/sökväg/till/planboard/mcp-server.ts"],
      "env": {
        "PLANBOARD_URL": "https://din-server.se"
      }
    }
  }
}
\`\`\`

**Steg:**
1. Stäng Claude Desktop
2. Öppna konfigurationsfilen
3. Lägg till \`planboard\`-blocket under \`mcpServers\`
4. Ändra sökvägen och \`PLANBOARD_URL\`
5. Starta Claude Desktop igen

**Verifiera:** Be Claude *"Använd planboard och lista alla utrymmen"*`;

const mcpClaudeCode = `### Claude Code

Lägg till i \`.claude/settings.json\` (per projekt) eller \`~/.claude/settings.json\` (globalt):

\`\`\`json
{
  "mcpServers": {
    "planboard": {
      "command": "npx",
      "args": ["tsx", "/sökväg/till/planboard/mcp-server.ts"],
      "env": {
        "PLANBOARD_URL": "https://din-server.se"
      }
    }
  }
}
\`\`\`

**Användning:**

\`\`\`
> Läs planen "api-design" i projektet backend under utrymmet max
> Skriv en plan som sammanfattar ändringarna vi gjort idag
> Lista alla planer i projektet migration
\`\`\`

Claude Code använder planboard-verktygen automatiskt när det är relevant.

**Skills (valfritt):**

Planboard inkluderar färdiga Claude Code skills för findings. Symlinkas till ditt projekt:

\`\`\`bash
ln -s /sökväg/till/planboard/claude/skills/finding.md .claude/skills/finding.md
\`\`\`

Sedan kan du köra:

- \`/finding\` — skapa en finding från kontext
- \`/finding list\` — lista öppna findings
- \`/finding grab <titel>\` — plocka upp och börja jobba
- \`/finding resolve <titel>\` — markera som löst`;

const mcpCodex = `### OpenAI Codex

Skapa \`codex.json\` i projektets rot eller \`~/.codex/config.json\` globalt:

\`\`\`json
{
  "mcpServers": {
    "planboard": {
      "command": "npx",
      "args": ["tsx", "/sökväg/till/planboard/mcp-server.ts"],
      "env": {
        "PLANBOARD_URL": "https://din-server.se"
      }
    }
  }
}
\`\`\`

> **Tips:** Se till att \`npx\` och \`tsx\` finns i PATH för den miljö Codex körs i.`;

const mcpOther = `### Annan MCP-klient

Planboard följer MCP-specifikationen och fungerar med alla klienter som stödjer stdio-transport.

**Grundmönster:**

1. **Kommando:** \`npx tsx /sökväg/till/planboard/mcp-server.ts\`
2. **Miljövariabel:** \`PLANBOARD_URL=https://din-server.se\`
3. **Transport:** \`stdio\` (standard)

Byt ut \`din-server.se\` mot URL:en till din Planboard-instans.`;


// --- Page sections ---

const sections = [
  { id: "overview", label: "Översikt", content: overviewContent },
  { id: "setup", label: "Installation", content: setupContent },
  { id: "mcp", label: "MCP-server" },
];

function McpSection() {
  return (
    <div>
      <MarkdownRenderer content={mcpIntro} />
      <div className="mt-8">
        <DocsTabs
          tabs={[
            {
              id: "claude-desktop",
              label: "Claude Desktop",
              content: <MarkdownRenderer content={mcpClaudeDesktop} />,
            },
            {
              id: "claude-code",
              label: "Claude Code",
              content: <MarkdownRenderer content={mcpClaudeCode} />,
            },
            {
              id: "codex",
              label: "OpenAI Codex",
              content: <MarkdownRenderer content={mcpCodex} />,
            },
            {
              id: "other",
              label: "Annan klient",
              content: <MarkdownRenderer content={mcpOther} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <>
      <Navbar crumbs={[{ label: "Dokumentation" }]} />

      {/* Top-level section tabs */}
      <div
        className="mb-6 flex gap-1 overflow-x-auto rounded-xl p-1.5"
        style={{ background: "var(--bg-elevated)" }}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              background:
                activeSection === s.id ? "var(--bg-card)" : "transparent",
              color:
                activeSection === s.id ? "var(--fg)" : "var(--fg-muted)",
              boxShadow:
                activeSection === s.id ? "var(--shadow-card)" : "none",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div
        className="rounded-xl border p-8 md:p-10"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {activeSection === "mcp" ? (
          <McpSection />
        ) : (
          <MarkdownRenderer
            content={
              sections.find((s) => s.id === activeSection)?.content ?? ""
            }
          />
        )}
      </div>
    </>
  );
}
