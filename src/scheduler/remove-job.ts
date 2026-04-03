import { IScheduler } from "./types.js";

export async function removeJob(this: IScheduler, id: string | number) {
  const job = await this.store.getJob(id);
  if (!job) {
    this.emit("scheduler:error", new Error(`${id} not found`));
    return false;
  }

  return this.store.removeJob(id);
}
