import { IScheduler } from "./scheduler.js";

export async function getJob(this: IScheduler, id: string | number) {
  return await this.store.getJob(id);
}
