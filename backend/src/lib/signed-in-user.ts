import { prisma } from "@/lib/prisma";
import { rolesOf, permissionsOf, portalsOf } from "@/lib/permissions";

/**
 * The signed-in user as every auth endpoint returns it (sign-in, 2-step,
 * sign-up, password reset, invite, /me, profile and photo updates): roles held
 * (main first), permissions, and portals with home first. The site stores
 * this object, so a response without portals would hide the portal switcher
 * until the next page load. Null if the account is gone.
 */
export async function signedInUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, extraRoles: true }
  });
  if (!user) return null;
  const { extraRoles, ...rest } = user;
  const holder = { role: user.role, roles: extraRoles };
  const portals = portalsOf(holder);
  return { ...rest, roles: rolesOf(holder), permissions: permissionsOf(holder), portals, homePath: portals[0]?.path ?? "/dashboard" };
}
