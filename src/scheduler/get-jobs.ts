import { IScheduler } from "./scheduler.js";

export async function getJobs(this: IScheduler) {
  return this.store.getJobs();
}
