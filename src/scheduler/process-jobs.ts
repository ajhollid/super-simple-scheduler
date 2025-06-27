import { IScheduler } from "./index.js";

export async function processJobs(this: IScheduler) {
  const now = Date.now();
  const jobsToProcess = this._jobs.splice(0);

  for (const job of jobsToProcess) {
    // Job has been paused, add it back to the queue
    if (!job.active) {
      this._jobs.push(job);
      continue;
    }

    const shouldRun =
      job.lastRunAt === null ||
      (job.repeat !== null && now - job.lastRunAt >= job.repeat);

    if (!shouldRun) {
      this._jobs.push(job);
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
