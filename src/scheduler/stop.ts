import { IScheduler } from "./scheduler.js";

export async function stop(this: IScheduler) {
  this.logger.info("Scheduler stopped");
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
  this.intervalId = null;
  return true;
}
