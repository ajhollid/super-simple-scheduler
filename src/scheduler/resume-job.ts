import { IScheduler } from "./types.js";

export async function resumeJob(this: IScheduler, id: string | number) {
  const job = await this.store.getJob(id);
  if (!job) {
    this.logger.warn(`Job with id ${id} not found, cannot resume`);
    return false;
  }
  return await this.store.updateJob(id, { active: true });
}
