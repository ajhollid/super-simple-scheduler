import { IScheduler } from "./scheduler.js";

export async function processJobs(this: IScheduler) {
  const jobs = await this.store.getJobs();

  for (const job of jobs) {
    const shouldRun = shouldJobRun.call(this, job);
    if (!shouldRun) {
      continue;
    }

    const jobFn = await this.store.getTemplate(job.template);
    if (!jobFn) {
      this.logger.warn(`Job template "${job.template}" not found`);
      continue;
    }

    this.processNextJob(job, jobFn).catch((error: Error) => {
      this.logger.error("Unexpected error while processing job:", error);
    });
  }
}

/**
 * Determines if a job should run based on all execution conditions
 */
export function shouldJobRun(this: IScheduler, job: any): boolean {
  const now = Date.now();

  // Skip inactive jobs
  if (!job.active) {
    return false;
  }

  // Skip jobs that haven't reached their start time yet
  if (job.startAt && job.startAt > now) {
    return false;
  }

  // If job has never run before, it should run immediately
  if (!job.lastRunAt) {
    return true;
  }

  // If job has no repeat interval, it's a one-time job that has already run
  if (!job.repeat) {
    return false;
  }

  // For repeating jobs, check if enough time has passed since last run
  const timeSinceLastRun = now - job.lastRunAt;
  return timeSinceLastRun >= job.repeat;
}
