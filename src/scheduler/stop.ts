import { IScheduler } from "./types.js";

export async function stop(this: IScheduler) {
  this.emit("scheduler:stop");
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
  this.intervalId = null;

  if (this.running.size > 0) {
    this.emit("scheduler:drain", this.running.size);
    await Promise.all(this.running);
  }

  return await this.store.close();
}
