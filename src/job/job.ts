export interface IJob {
  id: string | number;
  template: string;
  data?: any;
  repeat?: number;
  maxRetries?: number;
  active: boolean;
  lastRunAt?: number | null;
  lastFinishedAt?: number | null;
  lockedAt?: number | null;
  lastFailedAt?: number | null;
  lastFailReason?: string | null;
  failCount?: number;
  runCount?: number;
}
