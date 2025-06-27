export interface IJob {
  id: string | number;
  template: string;
  data?: any;
  repeat?: number;
  lastRunAt?: number | null;
  lockedAt?: number | null;
  maxRetries?: number;
  active: boolean;
  lastFailedAt?: number | null;
  lastFailReason?: string | null;
  failCount?: number;
}
