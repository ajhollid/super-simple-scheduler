import { IScheduler } from "./types.js";

export async function pauseJob(this: IScheduler, id: string | number) {
  const job = await this.store.getJob(id);
  if (!job) {
    this.emit("scheduler:error", new Error(`${id} not found, cannot pause`));
    return false;
  }
  return await this.store.updateJob(id, { active: false });
}
