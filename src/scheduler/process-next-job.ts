import { IJob } from "../job/job.js";
import { IScheduler } from "./scheduler.js";

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
