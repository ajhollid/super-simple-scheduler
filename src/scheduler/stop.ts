import { IScheduler } from "./types.js";

export async function stop(this: IScheduler) {
  this.logger.info("Scheduler stopped");
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
  this.intervalId = null;

  if (this.running.size > 0) {
    this.logger.info(
      `Waiting for ${this.running.size} running job(s) to finish...`,
    );
    await Promise.all(this.running);
  }

  return await this.store.close();
}
