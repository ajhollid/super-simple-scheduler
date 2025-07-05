import { IScheduler } from "./scheduler.js";

export async function start(this: IScheduler) {
  this.logger.info("Scheduler started");

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  const initResult = await this.store.init();

  if (!initResult) {
    return false;
  }

  this.intervalId = setInterval(() => {
    this.processJobs();
  }, this.processEvery);

  return true;
}
