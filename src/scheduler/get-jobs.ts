import { IScheduler } from "./types.js";

// This function must return copies, not references to ensure proper internal state and locking
export async function getJobs(this: IScheduler) {
  return this.store.getJobs();
}
