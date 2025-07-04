import { IScheduler } from "./scheduler.js";

export async function removeJob(this: IScheduler, id: string | number) {
  const job = await this.store.getJob(id);
  if (!job) {
    this.logger.warn(`Job with id ${id} not found`);
    return false;
  }

  await this.store.removeJob(id);

  return true;
}
