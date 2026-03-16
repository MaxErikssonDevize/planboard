# Planboard

Planboard är ett verktyg för team som jobbar med AI-driven utveckling. Det ger en central plats för planer och findings — utan att skräpa ned kundens Jira.

## Varför Planboard?

Under AI-assisterad utveckling (med Claude, Codex m.fl.) dyker det ständigt upp saker som bör noteras men inte åtgärdas direkt: teknisk skuld, potentiella buggar, förbättringsförslag. Dessa hamnar lätt i ingenstans — för stora för en TODO-kommentar, för små för ett Jira-ärende.

Planboard löser det med:

- **Planer** — Markdown-dokument som AI-agenter kan läsa och skriva direkt via MCP
- **Findings** — Lättvikts-ärenden med status, prioritet, taggar och tilldelning
- **MCP-server** — Claude och Codex kan skapa findings och läsa planer utan manuellt kopierande

## Funktioner

- Utrymmen → Projekt → Planer/Findings
- Markdown-editor med split-view (redigera + förhandsvisning)
- Findings board med statusfilter (utkast, öppen, pågår, löst, avfärdad)
- Kommentarer i markdown på findings
- Profiler för tilldelning (ingen inloggning — bara ett namn)
- Dela planer via publik read-only-länk
- Ladda upp befintliga `.md`-filer
- MCP-integration med Claude Desktop, Claude Code och OpenAI Codex
- Claude Code skills (`/finding`, `/finding list`, `/finding grab`)
- Docker-deployment för NAS/server
- Konfigurerbart appnamn och ikon via env

## Requirements

- **Node.js** 22+
- **PostgreSQL** 15+ (körs enklast via Docker)
- **npm** 10+

## Installation

### Docker (rekommenderat)

```bash
git clone git@github.com:MaxErikssonDevize/planboard.git
cd planboard
docker compose up -d
```

Öppna `http://localhost:3000`. Postgres startar automatiskt i en container.

### Lokal utveckling

```bash
# 1. Klona
git clone git@github.com:MaxErikssonDevize/planboard.git
cd planboard

# 2. Installera dependencies
npm install

# 3. Konfigurera
cp .env.example .env
# Redigera .env med din DATABASE_URL

# 4. Starta databasen
docker compose up db -d

# 5. Skapa tabeller
npm run db:push

# 6. Starta dev-servern
npm run dev
```

### Miljövariabler

| Variabel | Beskrivning | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://planboard:planboard@localhost:5432/planboard` |
| `APP_NAME` | Appens namn i navbar och titel | `Planboard` |
| `APP_ICON` | Sökväg till ikon (placera i `public/`) | Första bokstaven i APP_NAME |

## MCP-server

Planboard inkluderar en MCP-server som gör det möjligt för AI-assistenter att läsa/skriva planer och findings direkt.

### Claude Code

Lägg till i `.claude/settings.json`:

```json
{
  "mcpServers": {
    "planboard": {
      "command": "npx",
      "args": ["tsx", "/sökväg/till/planboard/mcp-server.ts"],
      "env": {
        "PLANBOARD_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Claude Desktop

Lägg till i `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "planboard": {
      "command": "npx",
      "args": ["tsx", "/sökväg/till/planboard/mcp-server.ts"],
      "env": {
        "PLANBOARD_URL": "http://localhost:3000"
      }
    }
  }
}
```

### MCP-verktyg

| Verktyg | Beskrivning |
|---------|-------------|
| `list_spaces` | Lista utrymmen |
| `list_projects` | Lista projekt i ett utrymme |
| `list_plans` | Lista planer i ett projekt |
| `read_plan` | Läs en plan |
| `write_plan` | Skapa/uppdatera en plan |
| `delete_plan` | Radera en plan |
| `list_findings` | Lista findings (valfritt statusfilter) |
| `create_finding` | Skapa en finding |
| `update_finding` | Uppdatera status/prioritet/detaljer |
| `delete_finding` | Radera en finding |

## Claude Code Skills

Symlinkas till ditt projekt för att använda `/finding`-kommandot:

```bash
mkdir -p .claude/skills
ln -s /sökväg/till/planboard/claude/skills/finding.md .claude/skills/finding.md
```

| Kommando | Beskrivning |
|----------|-------------|
| `/finding` | Skapa en finding från kontext |
| `/finding list` | Lista öppna findings |
| `/finding grab <titel>` | Plocka upp och börja jobba |
| `/finding resolve <titel>` | Markera som löst |
| `/finding dismiss <titel>` | Avfärda |

## Teknikstack

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | Next.js 15, React 19, Tailwind 4 |
| Databas | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Formulär | react-hook-form |
| MCP | @modelcontextprotocol/sdk |
| Markdown | react-markdown + remark-gfm |
| Deploy | Docker (standalone output) |

## Scripts

| Script | Beskrivning |
|--------|-------------|
| `npm run dev` | Starta dev-server |
| `npm run build` | Bygg för produktion |
| `npm run start` | Kör produktionsbygge |
| `npm run mcp` | Starta MCP-servern |
| `npm run db:push` | Synka schema till databas |
| `npm run db:generate` | Generera migration |
| `npm run db:migrate` | Kör migrations |
| `npm run db:studio` | Öppna Drizzle Studio |
