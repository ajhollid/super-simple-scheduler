import { IScheduler } from "./index.js";

export function removeJob(this: IScheduler, id: string | number) {
  const job = this._jobs.find((job) => job.id === id);
  if (!job) {
    this._logger.warn(`Job with id ${id} not found`);
    return false;
  }
  this._jobs.splice(this._jobs.indexOf(job), 1);
  return true;
}
