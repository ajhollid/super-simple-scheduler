import { IScheduler } from "./index.js";

export function processJobs(this: IScheduler) {
  const now = Date.now();
  const jobsToProcess = this._jobs.splice(0);

  for (const job of jobsToProcess) {
    const shouldRun =
      job.lastRunAt === null ||
      (job.repeat !== null && now - job.lastRunAt >= job.repeat);

    if (!shouldRun) {
      this._jobs.push(job);
      continue;
    }

    const jobFn = this._jobTemplates.get(job.template);
    if (!jobFn) {
      console.warn(`Job template "${job.template}" not found`);
      continue;
    }

    (async () => {
      let success = false;
      try {
        await jobFn(job.data);
        job.retries = 0;
        success = true;
      } catch (err) {
        job.retries = (job.retries || 0) + 1;
        const maxRetries = job.maxRetries ?? 2;
        if (job.retries <= maxRetries) {
          console.warn(
            `Job failed (attempt ${job.retries}/${maxRetries}), retrying`
          );
          this._jobs.push(job);
          return;
        } else {
          console.error(
            `Job failed after ${maxRetries + 1} total attempts, dropping:`,
            err
          );
          return;
        }
      } finally {
        job.lastRunAt = now;
        if (success && job.repeat != null) {
          this._jobs.push(job);
        }
      }
    })();
  }
}
