import { IScheduler } from "./index.js";

export function resumeJob(this: IScheduler, id: string | number) {
  const job = this._jobs.find((job) => job.id === id);
  if (!job) {
    this._logger.warn(`Job with id ${id} not found`);
    return false;
  }
  job.active = true;
  this._logger.info(`[Scheduler] Job ${id} resumed`);
  return true;
}
