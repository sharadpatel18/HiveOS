// types/role.ts

/**
 * Single source of truth for all user roles.
 * Never use raw strings for roles anywhere else.
 */

export const ROLES = {
  USER: "USER",
  RECRUITER: "RECRUITER",
  FOUNDER: "FOUNDER",
  SUPERADMIN: "SUPERADMIN",
} as const;

/**
 * Union type of all roles
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy (higher = more power)
 * Useful for permission checks & promotions
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 1,
  RECRUITER: 2,
  FOUNDER: 3,
  SUPERADMIN: 4,
};

/**
 * Permission groups (recommended over direct role checks)
 */
export const ROLE_GROUPS = {
  // Company lifecycle
  CAN_CREATE_COMPANY: [ROLES.USER],
  CAN_MANAGE_COMPANY: [ROLES.FOUNDER],

  // Hiring
  CAN_POST_JOBS: [ROLES.RECRUITER, ROLES.FOUNDER],
  CAN_INVITE_RECRUITERS: [ROLES.FOUNDER],

  // System-level
  CAN_ACCESS_SYSTEM: [ROLES.SUPERADMIN],
} as const;

/**
 * Helper utilities
 */

export function hasRole(
  userRole: Role,
  allowedRoles: readonly Role[],
): boolean {
  return allowedRoles.includes(userRole);
}

export function hasHigherOrEqualRole(
  userRole: Role,
  requiredRole: Role,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
