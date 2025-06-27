import { IScheduler } from "./index.js";

export function getJobs(this: IScheduler) {
  return this._jobs;
}
