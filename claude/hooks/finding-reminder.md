# Finding Reminder Hook

## Setup

Add this to your project's `.claude/settings.json`:

```json
{
  "hooks": {
    "notification": [
      {
        "matcher": "task_completed",
        "command": "echo 'Om du hittade något som bör noteras — kör /finding för att spara det till Planboard.'"
      }
    ]
  }
}
```

## Alternative: Pre-commit reminder

Reminds before committing to check if there are unlogged findings:

```json
{
  "hooks": {
    "pre_tool_use": [
      {
        "matcher": "Bash:git commit",
        "command": "echo 'Påminnelse: Har du loggat eventuella findings? Kör /finding list för att kontrollera.'"
      }
    ]
  }
}
```

## Usage

These hooks are informational reminders. They don't block any actions — they just nudge the AI (or you) to remember to log discoveries.

Copy the relevant hook config into your project's `.claude/settings.json` to activate.
