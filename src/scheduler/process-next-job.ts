import { IScheduler } from "./index.js";

export function processNextJob(this: IScheduler) {
  const nextJob = this._jobs.shift();
  if (!nextJob) return;

  const now = Date.now();
  const shouldRun =
    nextJob.lastRunAt === null ||
    (nextJob.repeat !== null && now - nextJob.lastRunAt >= nextJob.repeat);

  if (!shouldRun) {
    this._jobs.push(nextJob);
    return;
  }

  const jobFn = this._jobTemplates.get(nextJob.template);
  if (!jobFn) return;

  (async () => {
    let success = false;

    try {
      await jobFn(nextJob.data);
      nextJob.retries = 0;
      success = true;
    } catch (err) {
      nextJob.retries = (nextJob.retries || 0) + 1;
      const maxRetries = nextJob.maxRetries ?? 2;
      if (nextJob.retries <= maxRetries) {
        console.warn(
          `Job failed (attempt ${nextJob.retries}/${maxRetries}), retrying`
        );
        this._jobs.push(nextJob);
        return;
      } else {
        console.error(
          `Job failed after ${maxRetries + 1} total attempts, dropping:`,
          err
        );
        return;
      }
    } finally {
      nextJob.lastRunAt = now;

      if (success && nextJob.repeat != null) {
        this._jobs.push(nextJob);
      }
    }
  })();
}
