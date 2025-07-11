import { IScheduler } from "./scheduler.js";
import { IJob } from "../job/job.js";

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

    processNextJob.call(this, job, jobFn).catch((error: Error) => {
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

export async function processNextJob(
  this: IScheduler,
  job: IJob,
  jobFn: (data?: any) => void | Promise<void>
): Promise<void> {
  if (job.lockedAt) {
    return;
  }

  const maxRetries = job.maxRetries ?? 3;
  let attempts = 0;
  let success = false;

  job.lockedAt = Date.now();
  await this.store.updateJob(job.id, { ...job });

  while (attempts < maxRetries) {
    attempts++;
    try {
      job.lastRunAt = Date.now();
      job.runCount = (job.runCount ?? 0) + 1;
      await jobFn(job.data);
      success = true;
      break;
    } catch (error) {
      job.failCount = (job.failCount ?? 0) + 1;
      job.lastFailedAt = Date.now();
      job.lastFailReason =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Job failed (attempt ${attempts}/${maxRetries})`, {
        job,
      });
    } finally {
      job.lastFinishedAt = Date.now();
    }
  }

  job.lockedAt = null;

  if (job.repeat === null) {
    await this.store.removeJob(job.id);
  }

  if (!success) {
    this.logger.error(
      `Job failed after ${maxRetries} immediate attempts, rescheduling.`
    );
  }
  await this.store.updateJob(job.id, { ...job });
}
