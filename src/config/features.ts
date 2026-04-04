type FeatureFlag =
  // ── Current agents ──────────────────────────────
  | "task_agent"
  | "calendar_agent"
  | "notes_agent"
  // ── Planned agents / features ───────────────────
  | "email_agent" // Compose and manage emails
  | "reminder_agent" // Push notifications / reminders
  | "analytics_agent" // Productivity insights & reports
  | "web_search_agent" // Real-time web search via Brave MCP
  | "file_agent" // Attach files to tasks/notes
  | "voice_input" // Speech-to-text input
  | "recurring_tasks" // Cron-style repeating tasks
  | "team_collaboration" // Multi-user workspaces
  | "ai_prioritisation" // Auto-prioritise tasks by urgency
  | "google_calendar_sync" // Two-way sync with Google Calendar
  | "notion_sync" // Two-way sync with Notion
  | "slack_integration" // Slack notifications
  | "webhook_events"; // Outbound webhooks on state changes

/** Default flag values — all OFF unless overridden by env vars */
const DEFAULTS: Record<FeatureFlag, boolean> = {
  // Active
  task_agent: true,
  calendar_agent: true,
  notes_agent: true,
  // Planned — flip to true (or set env var) when ready
  email_agent: false,
  reminder_agent: false,
  analytics_agent: false,
  web_search_agent: false,
  file_agent: false,
  voice_input: false,
  recurring_tasks: false,
  team_collaboration: false,
  ai_prioritisation: false,
  google_calendar_sync: false,
  notion_sync: false,
  slack_integration: false,
  webhook_events: false,
};

class FeatureFlags {
  private readonly flags: Map<FeatureFlag, boolean>;

  constructor() {
    this.flags = new Map();
    for (const [flag, defaultValue] of Object.entries(DEFAULTS) as [
      FeatureFlag,
      boolean,
    ][]) {
      const envKey = `FEATURE_${flag.toUpperCase()}`;
      const envValue = process.env[envKey];
      this.flags.set(
        flag,
        envValue !== undefined ? envValue === "true" : defaultValue,
      );
    }
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags.get(flag) ?? false;
  }

  all(): Record<string, boolean> {
    return Object.fromEntries(this.flags);
  }
}

export const features = new FeatureFlags();
export type { FeatureFlag };
