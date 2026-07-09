import type { Allowances, BlockTarget } from "../types.js";

export interface BlockEnforcement {
  syncBlockedTargets(blocked: BlockTarget[], allowances: Allowances): Promise<void>;
  grantTemporaryAccess(targetId: string): Promise<void>;
  revokeAccess(targetId: string): Promise<void>;
}
