export interface IJob<T = unknown> {
  id: string | number;
  template: string;
  data?: T;
  repeat?: number;
  maxRetries?: number;
  active: boolean;
  startAt?: number | null;
  lastRunAt?: number | null;
  lastFinishedAt?: number | null;
  lockedAt?: number | null;
  lastFailedAt?: number | null;
  lastFailReason?: string | null;
  failCount?: number;
  runCount?: number;
}
