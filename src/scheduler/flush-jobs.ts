import { IScheduler } from "./types.js";

export async function flushJobs(this: IScheduler) {
  return await this.store.flushJobs();
}
