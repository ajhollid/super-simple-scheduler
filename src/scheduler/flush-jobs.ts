import { IScheduler } from "./scheduler.js";

export async function flushJobs(this: IScheduler) {
  await this.store.flushJobs();
  return true;
}
