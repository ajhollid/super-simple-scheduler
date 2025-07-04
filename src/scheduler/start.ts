import { IScheduler } from "./scheduler.js";

export function start(this: IScheduler) {
  this.logger.info("Scheduler started");

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(() => {
    this.processJobs();
  }, this.processEvery);

  return true;
}
