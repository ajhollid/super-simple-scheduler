import { IScheduler } from "./types.js";

export async function getJobs(this: IScheduler) {
  return this.store.getJobs();
}
