import { IScheduler } from "./index.js";

export function updateJob(
  this: IScheduler,
  id: string | number,
  repeat: number
) {
  const job = this._jobs.find((job) => job.id === id);
  if (!job) {
    this._logger.warn(`[Scheduler] Job ${id} not found`);
    return false;
  }
  job.repeat = repeat;
  this._logger.info(`[Scheduler] Job ${id} updated`);
  return true;
}
