import { IScheduler } from "./scheduler.js";
import { IJob } from "../job/job.js";

export async function updateJob(
  this: IScheduler,
  id: string | number,
  updates: Partial<IJob>
) {
  return await this.store.updateJob(id, updates);
}
