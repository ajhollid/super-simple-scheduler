import { IScheduler } from "./scheduler.js";

export async function pauseJob(this: IScheduler, id: string | number) {
  return await this.store.updateJob(id, { active: false });
}
