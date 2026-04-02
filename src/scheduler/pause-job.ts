import { IScheduler } from "./types.js";

export async function pauseJob(this: IScheduler, id: string | number) {
  return await this.store.updateJob(id, { active: false });
}
