import { IJob } from "../job/job.js";
import { IScheduler } from "./index.js";
export async function processNextJob(
  this: IScheduler,
  now: number,
  job: IJob,
  jobFn: (data?: any) => void | Promise<void>
): Promise<void> {
  const maxRetries = job.maxRetries ?? 3;
  let attempts = 0;
  let success = false;

  while (attempts < maxRetries) {
    attempts++;
    try {
      await jobFn(job.data);
      success = true;
      break;
    } catch (error) {
      job.failCount = (job.failCount ?? 0) + 1;
      job.lastFailedAt = Date.now();
      job.lastFailReason =
        error instanceof Error ? error.message : "Unknown error";
      this._logger.warn(`Job failed (attempt ${attempts}/${maxRetries})`, {
        job,
      });
    }
  }

  job.lastRunAt = now;
  if (job.repeat !== null) {
    this._jobs.push(job);
  }

  if (!success) {
    this._logger.error(
      `Job failed after ${maxRetries} immediate attempts, rescheduling.`
    );
  }
}
