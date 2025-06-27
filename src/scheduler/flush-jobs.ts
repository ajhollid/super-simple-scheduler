import { IScheduler } from "./index.js";

export function flushJobs(this: IScheduler) {
  this._jobs = [];
  return true;
}
