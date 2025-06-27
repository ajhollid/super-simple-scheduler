import { IScheduler } from "./index.js";

export function removeJob(this: IScheduler, id: string | number) {
  const job = this._jobs.find((job) => job.id === id);
  if (!job) {
    this._logger.warn(`Job with id ${id} not found`);
    return false;
  }

  const index = this._jobs.findIndex((j) => j.id === job.id);

  if (index !== -1) {
    this._jobs.splice(index, 1);
    return true;
  } else return false;
}
