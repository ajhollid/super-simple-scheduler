import { IScheduler } from "./index.js";

export function stop(this: IScheduler) {
  console.log("Stopping scheduler");
  if (this._intervalId) {
    clearInterval(this._intervalId);
  }
  this._intervalId = null;
  return true;
}
