import { IScheduler } from "./types.js";

export async function start(this: IScheduler) {
  this.emit("scheduler:start");

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
