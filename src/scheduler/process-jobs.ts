import { IScheduler } from "./scheduler.js";

export async function processJobs(this: IScheduler) {
  const jobs = await this.store.getJobs();

  const now = Date.now();

  for (const job of jobs) {
    if (!job.active) {
      continue;
    }

    const shouldRun =
      !job.lastRunAt || (job.repeat && now - job.lastRunAt >= job.repeat);

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
