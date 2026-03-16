# Planboard — Claude Code Integration

Skills och hooks för att använda Planboard findings direkt i Claude Code.

## Förutsättningar

MCP-servern måste vara konfigurerad i Claude Code. Se `/docs` i Planboard-appen.

## Installation

### Alternativ 1: Symlink till ditt projekt

```bash
# Från ditt projektrepo
ln -s /sökväg/till/planboard/claude/skills/finding.md .claude/skills/finding.md
ln -s /sökväg/till/planboard/claude/skills/finding-list.md .claude/skills/finding-list.md
```

### Alternativ 2: Kopiera

```bash
cp /sökväg/till/planboard/claude/skills/*.md ditt-projekt/.claude/skills/
```

## Skills

| Kommando | Beskrivning |
|----------|-------------|
| `/finding` | Skapa en ny finding från kontext |
| `/finding list` | Lista öppna findings |
| `/finding grab <titel>` | Plocka upp en finding (→ in_progress) |
| `/finding resolve <titel>` | Markera som löst |
| `/finding dismiss <titel>` | Avfärda |

## Hooks

Se `hooks/finding-reminder.md` för konfigurationsexempel som påminner om att logga findings.
