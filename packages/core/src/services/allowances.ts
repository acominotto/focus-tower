import type { Allowances } from "../types.js";

export function mergeAllowances(local: Allowances, session: Allowances): Allowances {
  return { ...local, ...session };
}

export function filterActiveAllowances(allowances: Allowances, now = Date.now()): Allowances {
  const active: Allowances = {};
  for (const [targetId, allowance] of Object.entries(allowances)) {
    if (allowance.expiresAt === null || allowance.expiresAt > now) {
      active[targetId] = allowance;
    }
  }
  return active;
}

export function pruneExpiredAllowances(allowances: Allowances, now = Date.now()): {
  pruned: Allowances;
  changed: boolean;
} {
  const pruned = { ...allowances };
  let changed = false;

  for (const [targetId, allowance] of Object.entries(pruned)) {
    if (allowance.expiresAt !== null && allowance.expiresAt <= now) {
      delete pruned[targetId];
      changed = true;
    }
  }

  return { pruned, changed };
}

export function computeActiveBlocks(blockedIds: string[], allowances: Allowances): string[] {
  return blockedIds.filter((id) => !allowances[id]);
}
