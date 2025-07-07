import { IScheduler } from "./scheduler.js";

export async function flushJobs(this: IScheduler) {
  return await this.store.flushJobs();
}
