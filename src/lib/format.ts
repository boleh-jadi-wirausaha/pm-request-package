export type PillVariant = "accent" | "green" | "orange" | "gray";

export function getStatusPillVariant(stateName?: string): PillVariant {
  const s = (stateName ?? "").toLowerCase();
  if (s.includes("new")) return "accent";
  if (s.includes("progress") || s.includes("open")) return "green";
  if (s.includes("pending")) return "orange";
  return "gray";
}

export function formatRelativeTime(iso?: string): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
