import { IScheduler } from "./index.js";

export function start(this: IScheduler) {
  console.log("Scheduler started");
  console.log("Running every", this.processEvery, "ms");

  if (this._intervalId) {
    clearInterval(this._intervalId);
  }

  this._intervalId = setInterval(() => {
    this.processJobs();
  }, this.processEvery);

  return true;
}
