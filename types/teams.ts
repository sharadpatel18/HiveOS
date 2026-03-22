export type Team = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  teamleadId: string;
  personalTeam: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type MemberRole = "TEAMLEAD" | "MANAGER" | "FOUNDER" | "EMPLOYEE";

export const ROLE_LABELS: Record<string, string> = {
  TEAMLEAD: "Team Lead",
  MANAGER: "Manager",
  FOUNDER: "Founder",
  MEMBER: "Member",
};

// Roles that can be assigned when adding/changing
export const ASSIGNABLE_ROLES: MemberRole[] = [
  "TEAMLEAD",
  "MANAGER",
  "EMPLOYEE",
];

// All roles that get ANY management capability
export const PRIVILEGED_ROLES: MemberRole[] = [
  "TEAMLEAD",
  "MANAGER",
  "FOUNDER",
];

// Only these roles can ADD new members
export const ADD_MEMBER_ROLES: MemberRole[] = ["MANAGER", "FOUNDER"];

export function isPrivileged(role: string): boolean {
  return PRIVILEGED_ROLES.map((r) => r.toUpperCase()).includes(
    role.toUpperCase(),
  );
}

export function canAddMembers(role: string): boolean {
  return ADD_MEMBER_ROLES.map((r) => r.toUpperCase()).includes(
    role.toUpperCase(),
  );
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role.toUpperCase()] ?? role;
}

export function getRoleBadgeVariant(
  role: string,
): "default" | "secondary" | "outline" {
  switch (role.toUpperCase()) {
    case "FOUNDER":
      return "default";
    case "TEAMLEAD":
      return "default";
    case "MANAGER":
      return "outline";
    default:
      return "secondary";
  }
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
