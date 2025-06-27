import { IScheduler } from "./index.js";

export function start(this: IScheduler) {
  this._logger.info("Scheduler started");

  if (this._intervalId) {
    clearInterval(this._intervalId);
  }

  this._intervalId = setInterval(() => {
    this._processJobs();
  }, this.processEvery);

  return true;
}
