export interface IJob {
  id: string;
  template: string;
  data?: any;
  repeat?: number;
  lastRunAt?: Date | null;
  lockedAt?: Date | null;
  retries?: number;
  maxRetries?: number;
}
