import { IScheduler } from "./index.js";

export async function processJobs(this: IScheduler) {
  const now = Date.now();

  for (const job of this._jobs) {
    if (!job.active) {
      continue;
    }

    const shouldRun =
      job.lastRunAt === null ||
      (job.repeat !== null && now - job.lastRunAt >= job.repeat);

    if (!shouldRun) {
      continue;
    }

    const jobFn = this._jobTemplates.get(job.template);
    if (!jobFn) {
      this._logger.warn(`Job template "${job.template}" not found`);
      continue;
    }

    this._processNextJob(job, jobFn).catch((error) => {
      this._logger.error("Unexpected error while processing job:", error);
    });
  }
}
