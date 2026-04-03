import { IScheduler } from "./types.js";
import { IJob } from "../job/types.js";

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

    if (this.running.size >= this.concurrency) {
      await Promise.race(this.running);
    }

    const p = processNextJob
      .call(this, job, jobFn)
      .catch((error: Error) => {
        this.logger.error("Unexpected error while processing job:", error);
      })
      .finally(() => this.running.delete(p));

    this.running.add(p);
  }
}

/**
 * Determines if a job should run based on all execution conditions
 */
export function shouldJobRun(this: IScheduler, job: IJob): boolean {
  const now = Date.now();

  // Skip inactive jobs
  if (!job.active) return false;

  // Skip locked jobs
  if (job.lockedAt) return false;

  // Skip jobs that haven't reached their start time yet
  if (job.startAt && job.startAt > now) return false;

  // If job has never run before, it should run immediately
  if (!job.lastRunAt) return true;

  // If job has no repeat interval, it's a one-time job that has already run
  if (!job.repeat) return false;

  // For repeating jobs, check if enough time has passed since last run
  const timeSinceLastRun = now - job.lastRunAt;
  return timeSinceLastRun >= job.repeat;
}

export async function processNextJob(
  this: IScheduler,
  job: IJob,
  jobFn: (data?: any) => void | Promise<void>,
): Promise<void> {
  // Emit start
  this.emit("job:start", job);
  // Acquire lock
  const locked = await this.store.lockJob(job.id);
  if (!locked) {
    return;
  }

  const maxRetries = job.maxRetries ?? 3;
  let attempts = 0;
  let success = false;
  let runCount = job.runCount ?? 0;
  let failCount = job.failCount ?? 0;
  let lastRunAt: number | null = null;
  let lastFinishedAt: number | null = null;
  let lastFailedAt: number | null = null;
  let lastFailReason: string | null = null;

  while (attempts < maxRetries) {
    attempts++;
    // Emit attempt
    this.emit("job:attempt", job, attempts);
    try {
      lastRunAt = Date.now();
      runCount++;
      await jobFn(job.data);
      success = true;
      // Emit success
      this.emit("job:complete", job);
      break;
    } catch (error) {
      const existingJob = await this.store.getJob(job.id);
      if (!existingJob) {
        this.logger.info(
          `Job with id ${job.id} has been removed, aborting execution.`,
        );
        success = true;
        break;
      }
      failCount++;
      lastFailedAt = Date.now();
      lastFailReason = error instanceof Error ? error.message : "Unknown error";
      // Emit fail
      this.emit("job:fail", job, error);
      this.logger.warn(`Job failed (attempt ${attempts}/${maxRetries})`, {
        id: job.id,
        failReason: lastFailReason,
        failedAt: lastFailedAt,
      });
    } finally {
      lastFinishedAt = Date.now();
    }
  }

  // Release lock
  await this.store.unlockJob(job.id);

  if (!success) {
    this.logger.error(
      `Job failed after ${maxRetries} immediate attempts, job will be requeued on schedule`,
    );
  }

  await this.store.updateJob(job.id, {
    lastRunAt,
    lastFinishedAt,
    lastFailedAt,
    lastFailReason,
    runCount,
    failCount,
    lockedAt: null,
  });

  if (!job.repeat && success) {
    await this.store.removeJob(job.id);
  }
}
