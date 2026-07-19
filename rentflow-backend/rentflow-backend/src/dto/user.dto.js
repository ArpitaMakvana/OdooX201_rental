/**
 * Maps a Prisma `User` row to the exact shape `src/types/index.ts`
 * (`User`) expects in the frontend. Never include `password` or
 * `tokenVersion` — this is the one function everything funnels through
 * before a user object leaves the API, so it's the single place that
 * guarantees the password hash never leaks in a response body.
 */
export function toUserDTO(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    branch: user.branchId,
    status: user.status.toLowerCase(),
    createdAt: user.createdAt.toISOString(),
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
  };
}

export function toUserDTOList(users) {
  return users.map(toUserDTO);
}
