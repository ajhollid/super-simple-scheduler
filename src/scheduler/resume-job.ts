import { IScheduler } from "./types.js";

export async function resumeJob(this: IScheduler, id: string | number) {
  return await this.store.updateJob(id, { active: true });
}
