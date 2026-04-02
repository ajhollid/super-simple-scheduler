import { IScheduler } from "./types.js";
import { IJob } from "../job/types.js";

export async function updateJob(
  this: IScheduler,
  id: string | number,
  updates: Partial<IJob>,
) {
  return await this.store.updateJob(id, updates);
}
