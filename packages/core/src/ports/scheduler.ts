export interface AllowanceScheduler {
  schedule(id: string, whenMs: number): Promise<void>;
  cancel(id: string): Promise<boolean>;
}

export function allowanceAlarmId(targetId: string): string {
  return `allowance-${targetId}`;
}
