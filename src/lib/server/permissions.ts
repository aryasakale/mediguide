export type AdminRole = 'super_admin' | 'provider_admin' | 'reviewer' | 'read_only_admin';
export type Perm = 'dashboard:read' | 'providers:read' | 'providers:write' | 'providers:publish' | 'verification:review' | 'roles:manage' | 'logs:read';
// Mirrors public.has_perm() in SQL. The database re-enforces every write; this gives early, friendly 403s.
const M: Record<AdminRole, Perm[]> = {
  super_admin: ['dashboard:read', 'providers:read', 'providers:write', 'providers:publish', 'verification:review', 'roles:manage', 'logs:read'],
  provider_admin: ['dashboard:read', 'providers:read', 'providers:write'],
  reviewer: ['dashboard:read', 'providers:read', 'verification:review'],
  read_only_admin: ['dashboard:read', 'providers:read'],
};
export const can = (role: AdminRole | null | undefined, p: Perm) => !!role && M[role].includes(p);
export const ROLES = Object.keys(M) as AdminRole[];
