import { IScheduler } from "./index.js";

export function stop(this: IScheduler) {
  this._logger.info("Scheduler stopped");
  if (this._intervalId) {
    clearInterval(this._intervalId);
  }
  this._intervalId = null;
  return true;
}
