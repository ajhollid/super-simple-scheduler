import { IScheduler } from "./index.js";

export function pauseJob(this: IScheduler, id: string | number) {
  const job = this._jobs.find((job) => job.id === id);
  if (!job) {
    this._logger.warn(`[Scheduler] Job ${id} not found`);
    return false;
  }
  job.active = false;
  this._logger.info(`[Scheduler] Job ${id} paused`);
  return true;
}
